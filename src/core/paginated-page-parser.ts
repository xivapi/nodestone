import {PageParser} from "./page-parser";
import {Request} from "express";

export abstract class PaginatedPageParser extends PageParser {

    protected abstract getBaseURL(req: Request): string;

    protected getURL(req: Request): string {
        let query = '';
        if (req.query && req.query.page) {
            query = `?page=${req.query?.page}`;
        }
        return `${this.getBaseURL(req)}${query}`;
    }

    async parse(req: Request, columnsPrefix: string = ''): Promise<Object> {
        const baseParse: any = await super.parse(req, columnsPrefix);
        delete baseParse.ListNextButton;
        baseParse.Pagination = {
            Page: +baseParse.CurrentPage,
            PageTotal: +baseParse.NumPages,
            PageNext: +baseParse.CurrentPage < +baseParse.NumPages ? +baseParse.CurrentPage + 1 : null,
            PagePrev: +baseParse.CurrentPage < 1 ? null : +baseParse.CurrentPage - 1
        };
        delete baseParse.CurrentPage;
        delete baseParse.NumPages;
        return baseParse;
    }
}
