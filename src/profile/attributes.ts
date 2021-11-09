import {PageParser} from "../core/page-parser";
import * as attributes from '../lib/lodestone-css-selectors/profile/attributes.json';
import {Request} from "express";
import {CssSelectorRegistry} from "../core/css-selector-registry";

export class Attributes extends PageParser {
    protected getCSSSelectors(): CssSelectorRegistry {
        return attributes;
    }

    protected getURL(req: Request): string {
        return "https://na.finalfantasyxiv.com/lodestone/character/" + req.params.characterId;
    }

}
