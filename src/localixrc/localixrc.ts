import fs from "fs";
import path from "path";
import { ExtractCommandOptions } from "../commands/extract.command";

/**
 * @description finds and parses .localixrc file in current or any parent directory.
 * @returns
 */
export function readLocalixrc(): ExtractCommandOptions | null {
  let currentDir = process.cwd();
  while (currentDir !== "/") {
    const localixrcPath = path.join(currentDir, ".localixrc");
    if (fs.existsSync(localixrcPath)) {
      const options = JSON.parse(fs.readFileSync(localixrcPath, "utf-8"));

      return {
        ...options,
        output: path.resolve(currentDir, options.output),
      };
    }
    currentDir = path.dirname(currentDir);
  }
  return null;
}
