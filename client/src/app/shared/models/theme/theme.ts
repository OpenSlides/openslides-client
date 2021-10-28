import { BaseModel } from '../base/base-model';
import { HtmlColor, Id } from 'app/core/definitions/key-types';

export interface ThemeRequiredValues {
    // Required
    name: string;
    primary_500: HtmlColor;
    accent_500: HtmlColor;
    warn_500: HtmlColor;
}

export interface ThemeOptionalValues {
    // Optional
    primary_50?: HtmlColor;
    primary_100?: HtmlColor;
    primary_200?: HtmlColor;
    primary_300?: HtmlColor;
    primary_400?: HtmlColor;
    primary_600?: HtmlColor;
    primary_700?: HtmlColor;
    primary_800?: HtmlColor;
    primary_900?: HtmlColor;
    primary_A100?: HtmlColor;
    primary_A200?: HtmlColor;
    primary_A400?: HtmlColor;
    primary_A700?: HtmlColor;
    accent_50?: HtmlColor;
    accent_100?: HtmlColor;
    accent_200?: HtmlColor;
    accent_300?: HtmlColor;
    accent_400?: HtmlColor;
    accent_600?: HtmlColor;
    accent_700?: HtmlColor;
    accent_800?: HtmlColor;
    accent_900?: HtmlColor;
    accent_A100?: HtmlColor;
    accent_A200?: HtmlColor;
    accent_A400?: HtmlColor;
    accent_A700?: HtmlColor;
    warn_50?: HtmlColor;
    warn_100?: HtmlColor;
    warn_200?: HtmlColor;
    warn_300?: HtmlColor;
    warn_400?: HtmlColor;
    warn_600?: HtmlColor;
    warn_700?: HtmlColor;
    warn_800?: HtmlColor;
    warn_900?: HtmlColor;
    warn_A100?: HtmlColor;
    warn_A200?: HtmlColor;
    warn_A400?: HtmlColor;
    warn_A700?: HtmlColor;
}

export class Theme extends BaseModel {
    public static readonly COLLECTION = 'theme';

    public id: Id;

    public organization_id: Id; // (organization/theme_ids)[];
    public theme_for_organization_id: Id; // (organization/theme_id);

    public constructor(input?: Partial<Theme>) {
        super(Theme.COLLECTION, input);
    }
}

export interface Theme extends ThemeRequiredValues, ThemeOptionalValues {}
