import { Request } from "express";
import { PageParser } from "../core/page-parser";
import * as character from "lodestone-css-selectors/profile/character.json";
import * as attributes from "lodestone-css-selectors/profile/attributes.json";
import * as gearset from "lodestone-css-selectors/profile/gearset.json";
import { CssSelectorRegistry, PAGE_REGION } from "../core/css-selector-registry";

export class Character extends PageParser {
  protected getURL(req: Request): string {
    return (
      "https://"+ PAGE_REGION + ".finalfantasyxiv.com/lodestone/character/" +
      req.params.characterId
    );
  }

  protected getCSSSelectors(): CssSelectorRegistry {
    return { ...character, ...attributes, ...gearset };
  }
}
