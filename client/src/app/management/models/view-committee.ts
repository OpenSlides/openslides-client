import { CML } from 'app/core/core-services/organization-permission';
import { Id } from 'app/core/definitions/key-types';
import { Committee } from 'app/shared/models/event-management/committee';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewUser } from 'app/site/users/models/view-user';
import { Observable, of } from 'rxjs';

import { ViewMeeting } from './view-meeting';
import { ViewOrganization } from './view-organization';
import { HasOrganizationTags } from './view-organization-tag';

export class ViewCommittee extends BaseViewModel<Committee> {
    public static COLLECTION = Committee.COLLECTION;
    protected _collection = Committee.COLLECTION;

    public get committee(): Committee {
        return this._model;
    }

    public get meetingAmount(): number {
        return this.meeting_ids?.length || 0;
    }

    public get memberAmount(): number {
        return this.user_ids?.length || 0;
    }

    public get hasForwardings(): boolean {
        return this.forward_to_committee_ids.length > 0;
    }

    public get hasReceivings(): boolean {
        return this.receive_forwardings_from_committee_ids.length > 0;
    }

    public get managerObservable(): Observable<ViewUser[]> {
        return of(this.getManagers());
    }

    public get managerAmount(): number {
        return this.getManagers().length || 0;
    }

    public getManagers(): ViewUser[] {
        const userIds = this.user_management_level_ids(CML.can_manage);
        return userIds ? userIds.map(userId => this.getViewUser(userId)) : [];
    }

    // Functions injected by the committee-repo
    public getViewUser: (id: Id) => ViewUser;
}
interface ICommitteeRelations {
    meetings: ViewMeeting[];
    default_meeting: ViewMeeting;
    users: ViewUser[];
    users_as_observable: Observable<ViewUser[]>;
    forward_to_committees: ViewCommittee[];
    receive_forwardings_from_committees: ViewCommittee[];
    organization: ViewOrganization;
    template_meeting: ViewMeeting;
    // user_management_levels: (cml: CML) => ViewUser[]; // Not working yet!
}
export interface ViewCommittee extends Committee, ICommitteeRelations, HasOrganizationTags {}
