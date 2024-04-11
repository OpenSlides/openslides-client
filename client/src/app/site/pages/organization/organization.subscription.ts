import { FULL_FIELDSET } from 'src/app/domain/fieldsets/misc';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import {
    MEETING_CREATE_SUBSCRIPTION,
    MEETING_LIST_SUBSCRIPTION
} from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

import { DEFAULT_FIELDSET } from '../../services/model-request-builder';

export const ORGANIZATION_SUBSCRIPTION = `organization_detail`;

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

export const getMeetingCreateSubscriptionConfig: SubscriptionConfigGenerator = () => ({
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [
            getMeetingCreateFollowConfig(`active_meeting_ids`),
            getMeetingCreateFollowConfig(`archived_meeting_ids`),
            getMeetingCreateFollowConfig(`template_meeting_ids`)
        ]
    },
    subscriptionName: MEETING_CREATE_SUBSCRIPTION
});

function getMeetingListFollowConfig(
    idField: `active_meeting_ids` | `archived_meeting_ids` | `template_meeting_ids`
): any {
    return {
        idField: idField,
        follow: [
            { idField: `committee_id`, fieldset: `name` },
            { idField: `organization_tag_ids`, fieldset: FULL_FIELDSET }
        ],
        fieldset: `list`
    };
}

function getMeetingCreateFollowConfig(
    idField: `active_meeting_ids` | `archived_meeting_ids` | `template_meeting_ids`
): any {
    return {
        idField: idField,
        follow: [{ idField: `committee_id`, fieldset: `name` }],
        fieldset: [`name`]
    };
}
