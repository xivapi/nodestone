import { Request } from "express";
import { PageParser } from "../core/page-parser";
import * as freecompany from "lodestone-css-selectors/freecompany/freecompany.json";
import { CssSelectorRegistry, PAGE_REGION } from "../core/css-selector-registry";

export class FreeCompany extends PageParser {
  protected getURL(req: Request): string {
    return (
      "https://"+ PAGE_REGION + ".finalfantasyxiv.com/lodestone/freecompany/" + req.params.fcId
    );
  }

  protected getCSSSelectors(): CssSelectorRegistry {
    return { ...freecompany };
  }
}
