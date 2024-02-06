import { Command } from "commander";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { TranslationUnit } from "../extractor/extractor";
import { JsonFormatter } from "../formatter/json.formatter";
import { readLocalixrc } from "../localixrc/localixrc";
import { GoogleTranslator } from "../translator/google-translator";

interface TranslateCommandOptions {
  /**
   * @description Specify the target translation language
   */
  target: string;
  /**
   * @description Sepcify the source translation language
   */
  source: string;
  /**
   * @description Specify the translation method (for now only google is supported)
   */
  method: string;
  /**
   * @description Specify the path for the config json file if the user translator is google
   */
  config: string;

  /**
   * @description Specify the path for the output translation file, if not specified the output will replace the input file
   */
  output?: string;

  /**
   * @description Specify the path for the input translation file, if not specified the `output` specified in localixrc will be used instead
   */
  input?: string;
}

export function addTranslateCommand(program: Command) {
  program
    .command("translate")
    .requiredOption(
      "-t, --target <target>",
      "Specify the target translation language"
    )
    .requiredOption(
      "-s, --source <locale>",
      "Sepcify the source translation language"
    )
    .requiredOption(
      "-m, --method <method>",
      "Specify the translation method (for now only google is supported)"
    )
    .requiredOption(
      "-c, --config <config>",
      "Specify the path for the config json file if the used translator is google"
    )
    .option(
      "-o, --output <output>",
      "Specify the path for the output translation file, if not specified the output will replace the input file"
    )
    .option(
      "-i, --input <input>",
      "Specify the path for the input translation file, if not specified the `output` specified in localixrc will be used instead"
    )
    .action((args) => runTranslate(args));
}

async function runTranslate(args: TranslateCommandOptions) {
  const { method, target: to, source: from } = args;
  const options = readLocalixrc();
  let translationResults: TranslationUnit[] = [];

  if (!options) {
    throw new Error(".localizerc file was not found");
  }

  const { jsonFormatter, output: rcoutput } = options;

  const output = args.output ?? rcoutput;
  const input = args.input ?? output;

  const formatter = new JsonFormatter({
    ...jsonFormatter,
    decodeOptions:
      options.jsonFormatter.decodeOptions.schema === "single"
        ? {
            ...options.jsonFormatter.decodeOptions,
            locales: [from],
          }
        : options.jsonFormatter.decodeOptions,
    encodeOptions:
      options.jsonFormatter.encodeOptions.schema === "single"
        ? {
            ...options.jsonFormatter.encodeOptions,
            locales: [to],
          }
        : options.jsonFormatter.encodeOptions,
  });

  const sourceUnits: TranslationUnit[] = existsSync(input)
    ? formatter.decoce(readFileSync(input, { encoding: "utf-8" }))
    : [];

  if (method === "google") {
    const configFilePath = args.config;
    const googleTranslator = new GoogleTranslator(configFilePath);
    translationResults = await googleTranslator.translate(
      sourceUnits,
      from,
      to
    );
  } else {
    console.log(`only google is supported for now 😔😔!`);
    return;
  }

  const formatted = formatter.encode(translationResults);

  writeFileSync(output, formatted, { encoding: "utf-8" });
}
