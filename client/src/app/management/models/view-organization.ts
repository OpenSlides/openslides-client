import { Organization } from 'app/shared/models/event-management/organization';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { Observable } from 'rxjs';

import { ViewCommittee } from './view-committee';
import { ViewMeeting } from './view-meeting';
import { ViewOrganizationTag } from './view-organization-tag';
import { ViewResource } from './view-resource';
import { ViewTheme } from './view-theme';

export class ViewOrganization extends BaseViewModel<Organization> {
    public static COLLECTION = Organization.COLLECTION;
    protected _collection = Organization.COLLECTION;

    public get organization(): Organization {
        return this._model;
    }
}
interface IOrganizationRelations {
    committees: ViewCommittee[];
    resources: ViewResource[];
    organization_tags: ViewOrganizationTag[];
    template_meetings: ViewMeeting[];
    template_meetings_as_observable: Observable<ViewMeeting[]>;
    active_meetings: ViewMeeting[];
    active_meetings_as_observable: Observable<ViewMeeting[]>;
    archived_meetings: ViewMeeting[];
    archived_meetings_as_observable: Observable<ViewMeeting[]>;
    theme: ViewTheme;
    themes: ViewTheme[];
}
export interface ViewOrganization extends Organization, IOrganizationRelations {}
