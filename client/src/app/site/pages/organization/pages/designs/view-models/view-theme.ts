import { Theme } from 'src/app/domain/models/theme/theme';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

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
