import {CssSelectorRegistry} from "../core/css-selector-registry";
import * as minions from '../lib/lodestone-css-selectors/profile/minion.json';
import {PageParser} from "../core/page-parser";

export class Minions extends PageParser {
    protected getCSSSelectors(): CssSelectorRegistry {
        return minions;
    }

    protected getLodestonePage(characterId: string): Promise<string> {
        return this.requestFunction(this.baseUrl + '/character/' + encodeURIComponent(characterId) + '/minion', {
            'User-Agent': 'Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; SCH-I535 Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        });
    }

    protected modifyParseResult(data: Record<string, unknown>): Record<string, unknown> {
        const { Minions, ...rest } = data;
        return {
            ...(Minions as object),
            ...rest,
        };
    }
}
