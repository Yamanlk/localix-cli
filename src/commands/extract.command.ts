import { Command } from "commander";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { Extractor, TranslationUnit } from "../extractor/extractor";
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

  const { output, casing, jsonFormatter } = options;

  const extractor = new Extractor({ casing });

  const units = extractor.extract();

  const formatter = new JsonFormatter(jsonFormatter);

  const sourceUnits: TranslationUnit[] = existsSync(output)
    ? formatter.decoce(readFileSync(output, { encoding: "utf-8" }))
    : [];

  const merger = new Merger();

  const mergedUnits = merger.merge(sourceUnits, units);

  const formatted = formatter.encode(mergedUnits);

  writeFileSync(output, formatted, { encoding: "utf-8" });
}
