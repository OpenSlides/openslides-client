import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

export const COMMITTEE_LIST_SUBSCRIPTION = `committee_list`;

export const getCommitteeListSubscriptionConfig = (getNextMeetingIdObservable: () => Observable<Id | null>) => ({
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [
            { idField: `committee_ids`, fieldset: `list`, follow: [{ idField: `user_ids`, fieldset: `accountList` }] }
        ]
    },
    subscriptionName: COMMITTEE_LIST_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !!id))
});
