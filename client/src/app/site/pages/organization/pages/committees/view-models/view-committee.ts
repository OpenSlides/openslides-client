import { Id } from '@app/domain/definitions/key-types';
import { Committee } from '@app/domain/models/comittees/committee';
import { BaseViewModel, ViewModelRelations } from '@app/site/base/base-view-model';
import { ViewMeeting } from '@app/site/pages/meetings/view-models/view-meeting';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { ViewOrganization } from '@app/site/pages/organization/view-models/view-organization';
import { Observable, of } from 'rxjs';

import { HasOrganizationTags } from '../../organization-tags/view-models/has-organization-tags';

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
        return (this.forward_to_committee_ids || []).length > 0;
    }

    public get hasReceivings(): boolean {
        return (this.receive_forwardings_from_committee_ids || []).length > 0;
    }

    public get managerObservable(): Observable<ViewUser[]> {
        return of(this.getManagers());
    }

    public get managerAmount(): number {
        return this.getManagers().length || 0;
    }

    public getManagers(): ViewUser[] {
        return this.managers;
    }

    // Functions injected by the committee-repo
    public getViewUser!: (id: Id) => ViewUser | null;
}
interface ICommitteeRelations {
    meetings: ViewMeeting[];
    default_meeting: ViewMeeting;
    users: ViewUser[];
    native_users: ViewUser[];
    forward_to_committees: ViewCommittee[];
    receive_forwardings_from_committees: ViewCommittee[];
    organization: ViewOrganization;
    managers: ViewUser[];
    parent: ViewCommittee;
    all_parents: ViewCommittee[];
    all_childs: ViewCommittee[];
}
export interface ViewCommittee extends Committee, ViewModelRelations<ICommitteeRelations>, HasOrganizationTags {}
