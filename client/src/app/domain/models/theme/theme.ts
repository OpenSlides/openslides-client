import { HtmlColor, Id } from '../../definitions/key-types';
import { BaseModel } from '../base/base-model';

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

export interface ThemeGeneralColors {
    headbar: HtmlColor;
    yes: HtmlColor;
    no: HtmlColor;
    abstain: HtmlColor;
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

    public static readonly REQUESTABLE_FIELDS: (keyof Theme)[] = [
        `id`,
        `name`,
        `accent_100`,
        `accent_200`,
        `accent_300`,
        `accent_400`,
        `accent_50`,
        `accent_500`,
        `accent_600`,
        `accent_700`,
        `accent_800`,
        `accent_900`,
        `accent_a100`,
        `accent_a200`,
        `accent_a400`,
        `accent_a700`,
        `primary_100`,
        `primary_200`,
        `primary_300`,
        `primary_400`,
        `primary_50`,
        `primary_500`,
        `primary_600`,
        `primary_700`,
        `primary_800`,
        `primary_900`,
        `primary_a100`,
        `primary_a200`,
        `primary_a400`,
        `primary_a700`,
        `warn_100`,
        `warn_200`,
        `warn_300`,
        `warn_400`,
        `warn_50`,
        `warn_500`,
        `warn_600`,
        `warn_700`,
        `warn_800`,
        `warn_900`,
        `warn_a100`,
        `warn_a200`,
        `warn_a400`,
        `warn_a700`,
        `headbar`,
        `yes`,
        `no`,
        `abstain`,
        `theme_for_organization_id`,
        `organization_id`
    ];
}

export interface Theme extends ThemeRequiredValues, ThemeOptionalValues, Partial<ThemeGeneralColors> {}
