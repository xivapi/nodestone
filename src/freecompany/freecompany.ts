import { Request } from "express";
import { PageParser } from "../core/page-parser";
import * as freecompany from "../lib/lodestone-css-selectors/freecompany/freecompany.json";
import { CssSelectorRegistry } from "../core/css-selector-registry";

export class FreeCompany extends PageParser {
  protected getURL(req: Request): string {
    return (
      "https://na.finalfantasyxiv.com/lodestone/freecompany/" + req.params.fcId
    );
  }

  protected getCSSSelectors(): CssSelectorRegistry {
    return { ...freecompany };
  }
}
