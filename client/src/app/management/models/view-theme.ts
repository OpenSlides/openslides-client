import { BaseViewModel } from '../../site/base/base-view-model';
import { Theme } from '../../shared/models/theme/theme';
import { ViewOrganization } from './view-organization';

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
