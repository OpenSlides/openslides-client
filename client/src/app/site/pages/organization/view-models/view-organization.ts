import { Organization } from 'src/app/domain/models/organizations/organization';

import { BaseViewModel, ViewModelRelations } from '../../../base/base-view-model';
import { ViewMediafile } from '../../meetings/pages/mediafiles';
import { ViewMeeting } from '../../meetings/view-models/view-meeting';
import { ViewUser } from '../../meetings/view-models/view-user';
import { ViewGender } from '../pages/accounts/pages/gender/view-models/view-gender';
import { ViewCommittee } from '../pages/committees';
import { ViewTheme } from '../pages/designs';
import { ViewOrganizationTag } from '../pages/organization-tags';
import { ViewResource } from '../pages/resources';

export class ViewOrganization extends BaseViewModel<Organization> {
    public static COLLECTION = Organization.COLLECTION;

    public get organization(): Organization {
        return this._model;
    }
}
interface IOrganizationRelations {
    committees: ViewCommittee[];
    resources: ViewResource[];
    organization_tags: ViewOrganizationTag[];
    active_meetings: ViewMeeting[];
    archived_meetings: ViewMeeting[];
    template_meetings: ViewMeeting[];
    mediafiles: ViewMediafile[];
    theme: ViewTheme;
    themes: ViewTheme[];
    users: ViewUser[];
    genders: ViewGender[];
    published_mediafiles: ViewMediafile[];
}
export interface ViewOrganization extends Organization, ViewModelRelations<IOrganizationRelations> {}
