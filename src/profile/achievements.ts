import {Request} from "express";
import {CssSelectorRegistry} from "../core/css-selector-registry";
import * as achievements from '../lib/lodestone-css-selectors/profile/achievements.json';
import {PaginatedPageParser} from "../core/paginated-page-parser";

export class Achievements extends PaginatedPageParser {
    protected getCSSSelectors(): CssSelectorRegistry {
        return achievements;
    }

    protected getBaseURL(req: Request): string {
        return "https://na.finalfantasyxiv.com/lodestone/character/" + req.params.characterId + "/achievement";
    }

}
