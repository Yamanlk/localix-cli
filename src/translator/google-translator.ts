const { Translate } = require("@google-cloud/translate").v2;
import { readFileSync } from "fs";
import { TranslationUnit } from "../extractor/extractor";
import { Translator } from "./index.translator";

export class GoogleTranslator implements Translator {
  private translator: any | undefined;

  constructor(public gcpJsonFile: string) {
    const configFileContent: string = readFileSync(gcpJsonFile, {
      encoding: "utf-8",
    });
    const configData: any = JSON.parse(configFileContent);
    const projectId = configData.project_id;
    this.translator = new Translate({
      projectId,
      keyFilename: gcpJsonFile,
    });
  }

  async translate(
    sentences: TranslationUnit[],
    from: string,
    to: string
  ): Promise<TranslationUnit[]> {
    let translationResults: TranslationUnit[] = [];
    translationResults = await Promise.all(
      sentences.map(async (obj) => {
        const target = obj.target;
        const sentence = target?.[from] ?? obj.source;
        const [translation] = await this.translator.translate(sentence, to);
        if (obj && obj.target) {
          obj.target[to] = translation;
        }
        return obj;
      })
    );
    return translationResults;
  }
}
