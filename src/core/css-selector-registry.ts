export const PAGE_REGION = process.env.PAGE_REGION || "na"
export interface CssSelectorDefinition {
    selector: string;
    multiple?: boolean;
    attribute?: string;
    regex?: string
}

export interface CssSelectorRegistry {
    [key: string]: CssSelectorDefinition | CssSelectorRegistry;
}
