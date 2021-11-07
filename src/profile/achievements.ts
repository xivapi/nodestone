import {CssSelectorRegistry} from "../core/css-selector-registry";
import * as achievements from '../lib/lodestone-css-selectors/profile/achievements.json';
import {PageParser} from "../core/page-parser";

export class Achievements extends PageParser {
    protected getCSSSelectors(): CssSelectorRegistry {
        return achievements;
    }

    protected getURL(characterId: string): string {
        return this.baseUrl + '/character/' + encodeURIComponent(characterId) + '/achievement';
    }
}
