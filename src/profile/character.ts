import {PageParser} from "../core/page-parser";
import * as character from '../lib/lodestone-css-selectors/profile/character.json'
import {CssSelectorRegistry} from "../core/css-selector-registry";

export class Character extends PageParser {
    protected getCSSSelectors(): CssSelectorRegistry {
        return character;
    }

    protected getLodestonePage(characterId: string): Promise<string> {
        return this.requestFunction(this.baseUrl + '/character/' + encodeURIComponent(characterId));
    }
}
