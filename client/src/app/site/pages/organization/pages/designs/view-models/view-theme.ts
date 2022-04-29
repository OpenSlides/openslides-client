import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { Theme } from 'src/app/domain/models/theme/theme';

export const THEME_LIST_SUBSCRIPTION = `theme_list`;

interface ThemeRelations {
    organization: ViewOrganization;
    theme_for_organization: ViewOrganization;
}

export class ViewTheme extends BaseViewModel<Theme> {
    public static readonly COLLECTION = Theme.COLLECTION;

    public get theme(): Theme {
        return this._model;
    }
}

export interface ViewTheme extends Theme, ThemeRelations {}
