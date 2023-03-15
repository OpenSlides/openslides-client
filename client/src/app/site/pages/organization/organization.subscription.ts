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
            {
                idField: `active_meeting_ids`,
                follow: [{ idField: `group_ids`, isFullList: false }],
                fieldset: `list`
            },
            {
                idField: `archived_meeting_ids`,
                follow: [{ idField: `group_ids`, isFullList: false }],
                fieldset: `list`
            },
            {
                idField: `template_meeting_ids`,
                follow: [{ idField: `group_ids`, isFullList: false }],
                fieldset: `list`
            }
        ]
    },
    subscriptionName: MEETING_LIST_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !!id))
});

export const ORGANIZATION_SUBSCRIPTION = `organization`;

export const getOrganizationSubscriptionConfig = () => ({
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        fieldset: `settings`,
        additionalFields: [`committee_ids`, `organization_tag_ids`, `theme_ids`, `theme_id`],
        follow: [{ idField: `mediafile_ids`, fieldset: `organizationDetail` }]
    },
    subscriptionName: ORGANIZATION_SUBSCRIPTION,
    isDelayed: false
});
