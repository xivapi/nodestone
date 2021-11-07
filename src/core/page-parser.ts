import {JSDOM} from 'jsdom';
import {snakeCase} from 'lodash';
// @ts-ignore
import * as RegexTranslator from 'regex-translator';
import axios from 'axios';

import {CssSelectorDefinition, CssSelectorRegistry} from "./css-selector-registry";

export type Language = 'en' | 'de' | 'ja' | 'fr';
export type RequestFunction = (url: string, headers?: Record<string, string>) => Promise<string>;

const lodestoneBaseUrls: Record<Language, string> = {
    'en': 'https://na.finalfantasyxiv.com/lodestone',
    'de': 'https://de.finalfantasyxiv.com/lodestone',
    'ja': 'https://jp.finalfantasyxiv.com/lodestone',
    'fr': 'https://fr.finalfantasyxiv.com/lodestone',
};

export abstract class PageParser {

    private _language: Language;
    protected requestFunction: RequestFunction;
    protected baseUrl: string;

    public get language() {
        return this._language;
    }

    public set language(newLanguage: Language) {
        this._language = Object.keys(lodestoneBaseUrls).includes(newLanguage) ? newLanguage : 'en';
        this.baseUrl = lodestoneBaseUrls[this._language];
    }

    public constructor(language: Language = 'en', requestFunction?: RequestFunction) {
        this._language = Object.keys(lodestoneBaseUrls).includes(language) ? language : 'en';
        this.baseUrl = lodestoneBaseUrls[this._language];

        if (typeof requestFunction === 'function') {
            this.requestFunction = requestFunction;
        } else {
            const axiosInstance = axios.create();
            this.requestFunction = (url, headers) => {
                return axiosInstance.get(url, {headers})
                    .then(response => response.data);
            };
        }
    }

    protected abstract getLodestonePage(characterId: string): Promise<string>;

    protected abstract getCSSSelectors(): CssSelectorRegistry;

    public async get(characterId: string, columns: string[] = []): Promise<Record<string, unknown>> {
        const lodestonePage = await this.getLodestonePage(characterId).catch(error => {
            if (axios.isAxiosError(error) && error.response?.status) {
                throw new Error(String(error.response.status));
            }
            throw error;
        });

        const dom = new JSDOM(lodestonePage);
        const selectors = this.getCSSSelectors();
        const columnsToParse = columns.length > 0 ? columns : Object.keys(selectors).map(this.definitionNameToColumnName).filter(column => column !== 'default');
        
        let {document} = dom.window;

        return columnsToParse.reduce((acc, column) => {
            const definition = this.getDefinition(selectors, column);
            if (column === 'Root') {
                const context = this.handleColumn(definition, document)?.data;
                const contextDOM = new JSDOM(context);
                document = contextDOM.window.document;
                return {
                    ...acc
                }
            }
            const parsed = this.handleColumn(definition, document);
            if (parsed.isPatch || column === 'Entry') {
                return {
                    ...acc,
                    ...(parsed.data || {})
                }
            }
            return {
                ...acc,
                [column]: parsed.data
            }
        }, {});
    }

    private handleColumn(definition: CssSelectorRegistry | CssSelectorDefinition | null, document: Document): { isPatch: boolean, data: any } {
        if (definition === null) {
            return {isPatch: false, data: null};
        }
        if (this.isDefinition(definition)) {
            if (definition.multiple) {
                const elements: Element[] = [];
                document.querySelectorAll(definition.selector as any).forEach(e => elements.push(e));
                return {isPatch: false, data: elements.map(element => this.handleElement(element, definition))};
            }
            const element = document.querySelector(definition.selector as any);
            const data = this.handleElement(element, definition);
            return {
                isPatch: typeof data === 'object',
                data
            }
        }
        if (definition['ROOT']) {
            return {
                isPatch: false,
                data: this.handleDefinitionWithRoot(definition, document)
            }
        }
        return {
            isPatch: false,
            data: Object.keys(definition).reduce((acc, key) => {
                const parsed = this.handleColumn(this.getDefinition(definition, key), document);
                if (parsed.data) {
                    if (parsed.isPatch) {
                        return {
                            ...(acc || {}),
                            ...(parsed.data || {})
                        }
                    }
                    return {
                        ...(acc || {}),
                        [this.definitionNameToColumnName(key)]: parsed.data
                    }
                }
                return acc;
            }, null)
        }
    }

    private getDefinition(selectors: CssSelectorRegistry, name: string): CssSelectorDefinition | CssSelectorRegistry | null {
        if (selectors[name.toUpperCase()]) {
            return selectors[name.toUpperCase()];
        }
        if (selectors[snakeCase(name).toUpperCase()]) {
            return selectors[snakeCase(name).toUpperCase()];
        }
        return null;
    }

    private handleElement(element: Element, definition: CssSelectorDefinition): string | Record<string, string> | null {
        if (!element) {
            return null;
        }
        let res: string;
        if (definition.attribute) {
            res = element.attributes.getNamedItem(definition.attribute)?.value || '';
        } else {
            res = element.innerHTML || '';
        }
        if (definition.regex) {
            const mediary = RegexTranslator.getMediaryObjectFromRegexString(definition.regex);
            const regex = RegexTranslator.getRegexStringFromMediaryObject(mediary, 'ecma')
                .replace(/\(\?P/gm, '(?')
                .replace(/\\f\\n\\r\\t\\v/gm, '\\s\\f\\n\\r\\t\\v&nbsp;');
            const match = new RegExp(regex).exec(res);
            if (match) {
                return match.groups || null;
            }
            return null;
        }
        return res || null;
    }

    private isDefinition(definition: CssSelectorDefinition | CssSelectorRegistry): definition is CssSelectorDefinition {
        return definition.selector !== undefined;
    }

    private definitionNameToColumnName(key: string): string {
        return key.split('_')
            .map(str => `${str.slice(0, 1)}${str.slice(1).toLowerCase()}`)
            .join('')
            .replace(/Id/gmi, 'ID')
    }

    private handleDefinitionWithRoot(definition: CssSelectorRegistry, document: Document): any {
        const {ROOT, ...definitions} = definition;
        const mainList = this.handleColumn(ROOT, document)?.data;
        if (!mainList) {
            return null;
        }
        return {
            List: mainList.map((element: string) => {
                const miniDOM = new JSDOM(element);
                const miniDocument = miniDOM.window.document;
                return this.handleColumn(definitions, miniDocument)?.data;
            }).filter((row: any | null) => !!row)
        };
    }
}
