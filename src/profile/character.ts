import {Request} from "express";
import {PageParser} from "../core/page-parser";
import * as character from '../lib/lodestone-css-selectors/profile/character.json'
import {CssSelectorRegistry} from "../core/css-selector-registry";

export class Character extends PageParser {
    protected getURL(characterId: string): string {
        return "https://na.finalfantasyxiv.com/lodestone/character/" + characterId;
    }

    protected getCSSSelectors(): CssSelectorRegistry {
        return character;
    }
}
