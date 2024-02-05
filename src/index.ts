#! /usr/bin/env node

import * as chalk from "chalk";
import { Command } from "commander";
import * as figlet from "figlet";
import { addExtractCommand } from "./commands/extract.command";
import { addTranslateCommand } from "./commands/translate.command";

console.log(
  chalk.default.blue(figlet.textSync("@localix/cli", { font: "3D-ASCII" }))
);

const program = new Command();

program
  .version("1.0.0")
  .description("@localix/cli a CLI for localizing your js/ts files.");

// add commands
addExtractCommand(program);
addTranslateCommand(program);

program.parse();
