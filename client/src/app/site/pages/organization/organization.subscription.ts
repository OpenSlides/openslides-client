import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { MEETING_LIST_SUBSCRIPTION } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

import { DEFAULT_FIELDSET } from '../../services/model-request-builder';

export const getMeetingListSubscriptionConfig: SubscriptionConfigGenerator = () => ({
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [
            getMeetingListFollowConfig(`active_meeting_ids`),
            getMeetingListFollowConfig(`archived_meeting_ids`),
            getMeetingListFollowConfig(`template_meeting_ids`)
        ]
    },
    subscriptionName: MEETING_LIST_SUBSCRIPTION
});

export const ORGANIZATION_SUBSCRIPTION = `organization_detail`;

export const getOrganizationSubscriptionConfig: SubscriptionConfigGenerator = () => ({
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        fieldset: `settings`,
        additionalFields: [`committee_ids`, `organization_tag_ids`],
        follow: [
            { idField: `mediafile_ids`, fieldset: `organizationDetail` },
            { idField: `theme_id`, fieldset: DEFAULT_FIELDSET }
        ]
    },
    subscriptionName: ORGANIZATION_SUBSCRIPTION,
    isDelayed: false
});

function getMeetingListFollowConfig(
    idField: `active_meeting_ids` | `archived_meeting_ids` | `template_meeting_ids`
): any {
    return {
        idField: idField,
        follow: [
            { idField: `group_ids`, isFullList: false },
            { idField: `committee_id`, fieldset: `name` },
            `organization_tag_ids`
        ],
        fieldset: `list`
    };
}
