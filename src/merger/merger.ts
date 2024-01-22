import { TranslationUnit } from "../extractor/extractor";

export class Merger {
  /**
   *
   * @param source old translation units
   * @param target new translation units
   * @returns merged translation unit
   * @description returns target translation units, and sets `target` property for units without `traget` property from source translation unit if exists
   */
  merge(
    source: TranslationUnit[],
    target: TranslationUnit[]
  ): TranslationUnit[] {
    return target.map((unit) => {
      const target = unit.target;

      // ignore newly translated units
      if (target) {
        return unit;
      }

      const sourceUnit = source.find((_unit) => _unit.source === unit.source);

      // no source translation found
      if (!sourceUnit) {
        return unit;
      }

      return {
        ...unit,
        target: sourceUnit.target,
      };
    });
  }
}
