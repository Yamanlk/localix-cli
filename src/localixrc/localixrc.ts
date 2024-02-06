import fs from "fs";
import path from "path";
import { JsonFormatterOptions } from "../formatter/json.formatter";

export interface LocalixOptions {
  /**
   * @description output formatter.
   */
  format?: "json";
  /**
   * @description output file path, relative to .localixrc
   */
  output: string;
  /**
   * @description
   * - lower: transforms source key to lower case.
   * - upper: transforms source key to upper case.
   * - none: leaves source key as provided.
   */
  casing?: "lower" | "upper" | "none";

  /**
   * @description default locale to use in case a requested locale was not found
   */
  defaultLocale?: string;
  /**
   * @description options for json formatter
   */
  jsonFormatter: JsonFormatterOptions;
}

/**
 * @description finds and parses .localixrc file in current or any parent directory.
 * @returns
 */
export function readLocalixrc(): LocalixOptions | null {
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
