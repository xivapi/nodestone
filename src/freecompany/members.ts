import { Request } from "express";
import { CssSelectorRegistry } from "../core/css-selector-registry";
import * as members from "lodestone-css-selectors/freecompany/members.json";
import { PaginatedPageParser } from "../core/paginated-page-parser";

export class FCMembers extends PaginatedPageParser {
  protected getCSSSelectors(): CssSelectorRegistry {
    return members;
  }

  protected getBaseURL(req: Request): string {
    return (
      "https://na.finalfantasyxiv.com/lodestone/freecompany/" +
      req.params.fcId +
      "/member"
    );
  }

  async parse(req: Request, columnsPrefix: string = ""): Promise<Object> {
    const fromSuper: any = await super.parse(req, columnsPrefix);
    return fromSuper;
  }
}
