import { BaseModel } from '../base/base-model';
import { HtmlColor, Id } from '../../definitions/key-types';

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
    primary_a100?: HtmlColor;
    primary_a200?: HtmlColor;
    primary_a400?: HtmlColor;
    primary_a700?: HtmlColor;
    accent_50?: HtmlColor;
    accent_100?: HtmlColor;
    accent_200?: HtmlColor;
    accent_300?: HtmlColor;
    accent_400?: HtmlColor;
    accent_600?: HtmlColor;
    accent_700?: HtmlColor;
    accent_800?: HtmlColor;
    accent_900?: HtmlColor;
    accent_a100?: HtmlColor;
    accent_a200?: HtmlColor;
    accent_a400?: HtmlColor;
    accent_a700?: HtmlColor;
    warn_50?: HtmlColor;
    warn_100?: HtmlColor;
    warn_200?: HtmlColor;
    warn_300?: HtmlColor;
    warn_400?: HtmlColor;
    warn_600?: HtmlColor;
    warn_700?: HtmlColor;
    warn_800?: HtmlColor;
    warn_900?: HtmlColor;
    warn_a100?: HtmlColor;
    warn_a200?: HtmlColor;
    warn_a400?: HtmlColor;
    warn_a700?: HtmlColor;
}

// export class ThemeRequiredValues {
//     // Required
//     public name!: string;
//     public primary_500!: HtmlColor;
//     public accent_500!: HtmlColor;
//     public warn_500!: HtmlColor;
// }

// export class ThemeOptionalValues {
//     // Optional
//     public primary_50?: HtmlColor;
//     public primary_100?: HtmlColor;
//     public primary_200?: HtmlColor;
//     public primary_300?: HtmlColor;
//     public primary_400?: HtmlColor;
//     public primary_600?: HtmlColor;
//     public primary_700?: HtmlColor;
//     public primary_800?: HtmlColor;
//     public primary_900?: HtmlColor;
//     public primary_a100?: HtmlColor;
//     public primary_a200?: HtmlColor;
//     public primary_a400?: HtmlColor;
//     public primary_a700?: HtmlColor;
//     public accent_50?: HtmlColor;
//     public accent_100?: HtmlColor;
//     public accent_200?: HtmlColor;
//     public accent_300?: HtmlColor;
//     public accent_400?: HtmlColor;
//     public accent_600?: HtmlColor;
//     public accent_700?: HtmlColor;
//     public accent_800?: HtmlColor;
//     public accent_900?: HtmlColor;
//     public accent_a100?: HtmlColor;
//     public accent_a200?: HtmlColor;
//     public accent_a400?: HtmlColor;
//     public accent_a700?: HtmlColor;
//     public warn_50?: HtmlColor;
//     public warn_100?: HtmlColor;
//     public warn_200?: HtmlColor;
//     public warn_300?: HtmlColor;
//     public warn_400?: HtmlColor;
//     public warn_600?: HtmlColor;
//     public warn_700?: HtmlColor;
//     public warn_800?: HtmlColor;
//     public warn_900?: HtmlColor;
//     public warn_a100?: HtmlColor;
//     public warn_a200?: HtmlColor;
//     public warn_a400?: HtmlColor;
//     public warn_a700?: HtmlColor;
// }

export class Theme extends BaseModel {
    public static readonly COLLECTION = `theme`;

    public organization_id!: Id; // (organization/theme_ids)[];
    public theme_for_organization_id!: Id; // (organization/theme_id);

    public constructor(input?: Partial<Theme>) {
        super(Theme.COLLECTION, input);
    }
}

export interface Theme extends ThemeRequiredValues, ThemeOptionalValues {}
