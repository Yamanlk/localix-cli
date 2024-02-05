import { Command } from "commander";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { TranslationUnit } from "../extractor/extractor";
import { getFormatter } from "../formatter/json.formatter";
import { readLocalixrc } from "../localixrc/localixrc";
import { GoogleTranslator } from "../translator/google-translator";
export function addTranslateCommand(program: Command) {
  program
    .command("translate")
    .option("-t, --target <target>", "Specify the target translation language")
    .option(
      "-m, --method <method>",
      "Specify the translation method (for now only google is supported)"
    )
    .option(
      "-c, --config <config>",
      "Specify the path for the config json file if the used translator is google"
    )
    .action((args) => runTranslate(args));
}

async function runTranslate(args: any) {
  const to = args.target;
  const method = args.method;
  const options = readLocalixrc();
  let translationResults: TranslationUnit[] = [];

  if (!options) {
    throw new Error(".localizerc file was not found");
  }

  const { format, output, locales, casing } = options;

  const formatter = getFormatter(format, { locales });

  const sourceUnits: TranslationUnit[] = existsSync(output)
    ? formatter.decoce(readFileSync(output, { encoding: "utf-8" }))
    : [];

  if (method === "google") {
    const configFilePath = args.config;
    const googleTranslator = new GoogleTranslator(configFilePath);
    translationResults = await googleTranslator.translate(
      sourceUnits,
      "en",
      to
    );
  } else {
    console.log(`only google is supported for now 😔😔!`)
    return;
  }

  const formatted = formatter.encode(translationResults);

  writeFileSync(output, formatted, { encoding: "utf-8" });
}
