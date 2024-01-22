import { Command } from "commander";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { Extractor, TranslationUnit } from "../extractor/extractor";
import { Formatter } from "../formatter/index.formatter";
import { JsonFormatter } from "../formatter/json.formatter";
import { Merger } from "../merger/merger";

interface ExtractCommandOptions {
  format: "json";
  output: string;
  locales: string;
  lower: boolean;
}

export function addExtractCommand(program: Command) {
  program
    .command("extract")
    .description("extracts translation units to preferred output format")
    .option(
      "-f --format <json|xlif>",
      "select extrated files output format",
      "json"
    )
    .requiredOption("-o --output <path>", "output file path")
    .requiredOption("--locales <string,string,...>", "output locales")
    .option("--lower", "transforms id's into lower case", false)
    .action((args) => runExtract(args));
}

function runExtract(options: ExtractCommandOptions) {
  const { format, output, locales, lower } = options;

  const extractor = new Extractor({ lower });

  const units = extractor.extract();

  const formatter = getFormatter(format, { locales });

  const sourceUnits: TranslationUnit[] = existsSync(output)
    ? formatter.decoce(readFileSync(output, { encoding: "utf-8" }))
    : [];

  const merger = new Merger();

  const mergedUnits = merger.merge(sourceUnits, units);

  const formatted = formatter.encode(mergedUnits);

  writeFileSync(output, formatted, { encoding: "utf-8" });
}

function getFormatter(
  format: ExtractCommandOptions["format"],
  options: Pick<ExtractCommandOptions, "locales">
): Formatter {
  switch (format) {
    case "json":
    default:
      return new JsonFormatter({
        decodeOptions: {},
        encodeOptions: {
          locales: options.locales.split(","),
        },
      });
  }
}
