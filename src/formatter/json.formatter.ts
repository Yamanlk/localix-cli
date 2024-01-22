import { TranslationUnit } from "../extractor/extractor";
import { Formatter } from "./index.formatter";

export type JsonFormatterEncodeOptions = {
  locales: string[];
};

export class JsonFormatter implements Formatter {
  constructor(
    public options: {
      encodeOptions: JsonFormatterEncodeOptions;
      decodeOptions: {};
    }
  ) {}

  decoce(encoded: string): TranslationUnit[] {
    const json = JSON.parse(encoded);

    const units: TranslationUnit[] = Object.keys(json).map((key) => {
      return {
        source: key,
        target: json[key],
      };
    });

    return units;
  }
  encode(units: TranslationUnit[]): string {
    const json: Record<string, any> = {};

    this.options.encodeOptions.locales.forEach((locale) => {
      units.forEach((unit) => {
        json[unit.source] = json[unit.source] ?? {};
        json[unit.source][locale] = unit.target
          ? unit.target[locale] ?? unit.source
          : unit.source;
      });
    });

    return JSON.stringify(json, null, 2);
  }
}
