import { Theme } from '@app/domain/models/theme/theme';
import { BaseViewModel } from '@app/site/base/base-view-model';
import { ViewOrganization } from '@app/site/pages/organization/view-models/view-organization';

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
