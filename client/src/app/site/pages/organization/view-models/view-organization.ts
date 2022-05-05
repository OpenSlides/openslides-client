import { Observable } from 'rxjs';
import { ViewMeeting } from '../../meetings/view-models/view-meeting';
import { ViewOrganizationTag } from '../pages/organization-tags';
import { BaseViewModel } from '../../../base/base-view-model';
import { ViewCommittee } from '../pages/committees';
import { ViewTheme } from '../pages/designs';
import { ViewResource } from '../pages/resources';
import { Organization } from 'src/app/domain/models/organizations/organization';

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
    active_meetings: ViewMeeting[];
    active_meetings_as_observable: Observable<ViewMeeting[]>;
    archived_meetings: ViewMeeting[];
    archived_meetings_as_observable: Observable<ViewMeeting[]>;
    template_meetings: ViewMeeting[];
    template_meetings_as_observable: Observable<ViewMeeting[]>;
    theme: ViewTheme;
    themes: ViewTheme[];
}
export interface ViewOrganization extends Organization, IOrganizationRelations {}
