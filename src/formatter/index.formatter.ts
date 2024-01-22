import { TranslationUnit } from "../extractor/extractor";

export interface Formatter {
  encode(units: TranslationUnit[]): string;
  decoce(encoded: string): TranslationUnit[];
}
