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
            { idField: `active_meeting_ids`, follow: [{ idField: `group_ids` }], fieldset: `list` },
            { idField: `archived_meeting_ids`, follow: [{ idField: `group_ids` }], fieldset: `list` },
            { idField: `template_meeting_ids`, follow: [{ idField: `group_ids` }], fieldset: `list` }
        ]
    },
    subscriptionName: MEETING_LIST_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !!id))
});
