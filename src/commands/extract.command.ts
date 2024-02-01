import { Command } from "commander";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { Extractor, TranslationUnit } from "../extractor/extractor";
import { Formatter } from "../formatter/index.formatter";
import { JsonFormatter } from "../formatter/json.formatter";
import { readLocalixrc } from "../localixrc/localixrc";
import { Merger } from "../merger/merger";

export interface ExtractCommandOptions {
  format?: "json";
  output: string;
  locales: string[];
  casing?: "lower" | "upper" | "none";
}

export function addExtractCommand(program: Command) {
  program.command("extract").action((args) => runExtract());
}

function runExtract() {
  const options = readLocalixrc();

  if (!options) {
    throw new Error(".localizerc file was not found");
  }

  const { format, output, locales, casing } = options;

  const extractor = new Extractor({ casing });

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
          locales: options.locales,
        },
      });
  }
}
