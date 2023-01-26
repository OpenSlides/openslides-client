import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { MEETING_LIST_SUBSCRIPTION } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

export const getMeetingListSubscriptionConfig = (getNextMeetingIdObservable: () => Observable<Id | null>) => ({
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [
            getMeetingListFollowConfig(`active_meeting_ids`),
            getMeetingListFollowConfig(`archived_meeting_ids`),
            getMeetingListFollowConfig(`template_meeting_ids`)
        ]
    },
    subscriptionName: MEETING_LIST_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !!id))
});

function getMeetingListFollowConfig(
    idField: `active_meeting_ids` | `archived_meeting_ids` | `template_meeting_ids`
): any {
    return {
        idField: idField,
        follow: [
            { idField: `group_ids`, isFullList: false },
            { idField: `committee_id`, fieldset: `name` }
        ],
        fieldset: `list`
    };
}
