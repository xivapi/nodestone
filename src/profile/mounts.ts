import {CssSelectorRegistry} from "../core/css-selector-registry";
import * as mounts from '../lib/lodestone-css-selectors/profile/mount.json';
import {PageParser} from "../core/page-parser";

export class Mounts extends PageParser {
    protected getCSSSelectors(): CssSelectorRegistry {
        return mounts;
    }

    protected getLodestonePage(characterId: string): Promise<string> {
        return this.requestFunction(this.baseUrl + '/character/' + encodeURIComponent(characterId) + '/mount', {
            'User-Agent': 'Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; SCH-I535 Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        });
    }
    
    protected modifyParseResult(data: Record<string, unknown>): Record<string, unknown> {
        const { Mounts, ...rest } = data;
        return {
            ...(Mounts as object),
            ...rest,
        };
    }
}
