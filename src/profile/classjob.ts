import { Request } from "express";
import { CssSelectorRegistry, PAGE_REGION } from "../core/css-selector-registry";
import * as classjob from "lodestone-css-selectors/profile/classjob.json";
import { PaginatedPageParser } from "../core/paginated-page-parser";

export class ClassJob extends PaginatedPageParser {
  protected getCSSSelectors(): CssSelectorRegistry {
    return classjob;
  }

  protected getBaseURL(req: Request): string {
    return (
      "https://"+ PAGE_REGION + ".finalfantasyxiv.com/lodestone/character/" +
      req.params.characterId +
      "/class_job"
    );
  }

  async parse(req: Request, columnsPrefix: string = ""): Promise<Object> {
    const fromSuper: any = await super.parse(req, columnsPrefix);
    delete fromSuper.Pagination;
    return fromSuper;
  }
}
