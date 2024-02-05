import { TranslationUnit } from "../extractor/extractor";

export interface Translator {
  translate(sentences: TranslationUnit[], from: string, to: string): Promise<TranslationUnit[]>;
}
