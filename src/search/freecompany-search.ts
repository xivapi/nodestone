import { PaginatedPageParser } from "../core/paginated-page-parser";
import { CssSelectorRegistry } from "../core/css-selector-registry";
import * as freeCompanySearch from "../lib/lodestone-css-selectors/search/freecompany.json";
import { Request } from "express";

export class FreeCompanySearch extends PaginatedPageParser {
  protected getBaseURL(req: Request): string {
    let query = `?q=${req.query.name}`;
    if (req.query.dc) {
      query += `&worldname=_dc_${req.query.dc}`;
    } else if (req.query.server) {
      query += `&worldname=${req.query.server}`;
    }
    return `https://na.finalfantasyxiv.com/lodestone/freecompany/${query}`;
  }

  protected getCSSSelectors(): CssSelectorRegistry {
    return freeCompanySearch;
  }
}
