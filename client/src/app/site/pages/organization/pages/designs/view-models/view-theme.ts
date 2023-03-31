import { HtmlColor } from 'src/app/domain/definitions/key-types';
import { Theme } from 'src/app/domain/models/theme/theme';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
import { GENERAL_DEFAULT_COLORS } from 'src/app/site/services/theme.service';

interface ThemeRelations {
    organization: ViewOrganization;
    theme_for_organization: ViewOrganization;
}

export class ViewTheme extends BaseViewModel<Theme> {
    public static readonly COLLECTION = Theme.COLLECTION;

    public get theme(): Theme {
        return this._model;
    }

    public get yesColor(): HtmlColor {
        return this.yes ?? GENERAL_DEFAULT_COLORS.yes;
    }

    public get noColor(): HtmlColor {
        return this.no ?? GENERAL_DEFAULT_COLORS.no;
    }

    public get abstainColor(): HtmlColor {
        return this.abstain ?? GENERAL_DEFAULT_COLORS.abstain;
    }

    public get headbarColor(): HtmlColor {
        return this.headbar ?? GENERAL_DEFAULT_COLORS.headbar;
    }
}

export interface ViewTheme extends Theme, ThemeRelations {}
