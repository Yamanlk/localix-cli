import { TranslationUnit } from "../extractor/extractor";
import { Formatter } from "./index.formatter";

const SINGLE_SCHEMA_LOCALE_KEY = "SINGLE_SCHEMA_LOCALE_KEY";
export interface JsonFormatterOptions {
  encodeOptions: JsonFormatterEncodeOptions;
  decodeOptions: JsonFormatterDecodeOptions;
}

export type JsonFormatterBaseOptions = {
  /**
   * @description locales to be added to the target
   */
  locales?: string[];

  /**
   * @description
   * - single: each source translation corresponds to a single target translation,
   * encoded/decoded target include a single locale as the value of the source key,
   * other locales in translation units other that the mentioned locale will be ignored.
   * - multi: each source translation corresponds to multip target translations
   * when provided, locales must only, encoded/decoded target should include locales mentioned by `locales` property
   * other locales not mentioned will be ignored
   *
   * @default 'multi'
   */
  schema?: "multi" | "single";
};

export type JsonFormatterEncodeOptions = {} & JsonFormatterBaseOptions;
export type JsonFormatterDecodeOptions = {} & JsonFormatterBaseOptions;

export class JsonFormatter implements Formatter {
  constructor(
    public options: {
      encodeOptions: JsonFormatterEncodeOptions;
      decodeOptions: JsonFormatterDecodeOptions;
    }
  ) {}

  decoce(encoded: string): TranslationUnit[] {
    const json = JSON.parse(encoded);

    const units: TranslationUnit[] = Object.keys(json).map((key) => {
      return {
        source: key,
        target:
          this.options.decodeOptions.schema === "single"
            ? {
                [this.options.decodeOptions.locales?.[0] ??
                SINGLE_SCHEMA_LOCALE_KEY]: json[key],
              }
            : json[key],
      };
    });

    return units;
  }
  encode(units: TranslationUnit[]): string {
    const json: Record<string, any> = {};

    if (this.options.encodeOptions.schema === "single") {
      units.forEach((unit) => {
        json[unit.source] = unit.target
          ? unit.target[
              this.options.encodeOptions.locales?.[0] ??
                SINGLE_SCHEMA_LOCALE_KEY
            ]
          : unit.source;
      });
    } else {
      // todo: remove this check when options are validated
      if (!this.options.encodeOptions.locales) {
        throw new Error(
          'Please provide locales for "mulit" json schema, or use "single" json schema'
        );
      }

      this.options.encodeOptions.locales.forEach((locale) => {
        units.forEach((unit) => {
          json[unit.source] = json[unit.source] ?? {};
          json[unit.source][locale] = unit.target
            ? unit.target[locale] ?? unit.source
            : unit.source;
        });
      });
    }

    return JSON.stringify(json, null, 2);
  }
}
