import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Meeting } from 'src/app/domain/models/meetings/meeting';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

export const DASHBOARD_MEETING_LIST_SUBSCRIPTION = `dashboard_meeting_list`;

export const meetingFields: (keyof Meeting)[] = [
    `id`,
    `name`,
    `start_time`,
    `end_time`,
    `is_active_in_organization_id`,
    `is_archived_organization_id`,
    `template_for_organization_id`,
    `description`,
    `location`,
    `organization_tag_ids`
];

export const getDashboardMeetingListSubscriptionConfig = (getNextMeetingIdObservable: () => Observable<Id | null>) => ({
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [
            {
                idField: `active_meeting_ids`,
                fieldset: meetingFields
            },
            {
                idField: `archived_meeting_ids`,
                fieldset: meetingFields
            },
            {
                idField: `template_meeting_ids`,
                fieldset: meetingFields
            }
        ]
    },
    subscriptionName: DASHBOARD_MEETING_LIST_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !!id))
});
