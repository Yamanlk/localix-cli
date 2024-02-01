import * as ts from "typescript";

export interface TranslationFile {
  locale: string;
  units: Array<TranslationUnit>;
}
export interface TranslationUnit {
  source: string;
  target?: Record<string, string>;
  arguments?: Record<string, string>;
  context?: {
    sourceFile: string;
    lineNumber: string;
  };
}

export class Extractor {
  casing: (id: string) => string;

  constructor(public options: { casing?: "lower" | "upper" | "none" }) {
    switch (options.casing) {
      case "lower":
        this.casing = (id) => id.toLowerCase();
        break;
      case "upper":
        this.casing = (id) => id.toUpperCase();
        break;
      case "none":
      default:
        this.casing = (id) => id;
        break;
    }
  }

  extract(): TranslationUnit[] {
    const configFilePath = ts.sys.resolvePath("./tsconfig.json");
    const configFileText = ts.sys.readFile(configFilePath) ?? "";

    const configFileJson = ts.parseConfigFileTextToJson(
      configFilePath,
      configFileText
    );

    if (configFileJson.error) {
      console.error(
        "Error parsing tsconfig.json:",
        configFileJson.error.messageText
      );
      process.exit(1);
    }

    const configFile = ts.parseJsonConfigFileContent(
      configFileJson.config,
      ts.sys,
      ""
    );

    const program = ts.createProgram(configFile.fileNames, configFile.options);

    const sourceFiles = program.getSourceFiles();

    const units: TranslationUnit[] = [];

    sourceFiles
      .map((sourceFile) =>
        ts.createSourceFile(
          sourceFile.fileName,
          sourceFile.text,
          configFile.options.target ?? ts.ScriptTarget.ES2015,
          true,
          ts.ScriptKind.TS
        )
      )
      .forEach((node) => this.visit(node, units));

    return units;
  }

  visit(node: ts.Node, units: TranslationUnit[]) {
    if (node.kind === ts.SyntaxKind.TaggedTemplateExpression) {
      this.visitTaggedTemplateExpression(
        node as ts.TaggedTemplateExpression,
        units
      );
    }
    ts.forEachChild(node, (_node) => this.visit(_node, units));
  }

  visitTaggedTemplateExpression(
    node: ts.TaggedTemplateExpression,
    units: TranslationUnit[]
  ) {
    if (node.tag.getText() === "localize") {
      this.visitTemplateLiteral(node.template, units);
    }
  }

  visitTemplateLiteral(node: ts.TemplateLiteral, units: TranslationUnit[]) {
    if (node.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
      units.push({
        source: this.casing(node.text),
        arguments: {},
        context: {
          sourceFile: node.getSourceFile().fileName,
          lineNumber: ts
            .getLineAndCharacterOfPosition(
              node.getSourceFile(),
              node.getStart()
            )
            .line.toString(),
        },
      });
    } else {
      let id = "";
      let params: Record<string, string> = {};
      id += node.head.text;

      node.templateSpans.forEach((templateSpan, index) => {
        const param = `$${index + 1}`;
        params[param] = templateSpan.expression.getText();
        id += param;
        id += templateSpan.literal.text;
      });

      units.push({
        arguments: params,
        source: this.casing(id),
        context: {
          sourceFile: node.getSourceFile().fileName,
          lineNumber: ts
            .getLineAndCharacterOfPosition(
              node.getSourceFile(),
              node.getStart()
            )
            .line.toString(),
        },
      });
    }
  }
}
