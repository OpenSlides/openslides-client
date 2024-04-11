import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';

import { ViewMeeting } from '../../../meetings/view-models/view-meeting';
import { ViewCommittee } from './view-models';

export const COMMITTEE_LIST_SUBSCRIPTION = `committee_list`;
export const COMMITTEE_LIST_MINIMAL_SUBSCRIPTION = `committee_list`;
export const COMMITTEE_DETAIL_SUBSCRIPTION = `committee_detail`;
const MEETING_DETAIL_EDIT_SUBSCRIPTION = `committee_meeting_detail`;

export const getCommitteeListSubscriptionConfig: SubscriptionConfigGenerator = () => ({
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [
            { idField: `committee_ids`, fieldset: `list`, follow: [{ idField: `user_ids`, fieldset: `accountList` }] }
        ]
    },
    subscriptionName: COMMITTEE_LIST_SUBSCRIPTION
});

export const getCommitteeListMinimalSubscriptionConfig: SubscriptionConfigGenerator = () => ({
    modelRequest: {
        viewModelCtor: ViewOrganization,
        ids: [ORGANIZATION_ID],
        follow: [
            {
                idField: `committee_ids`,
                fieldset: [
                    `name`,
                    `description`,
                    `meeting_ids`,
                    `forward_to_committee_ids`,
                    `receive_forwardings_from_committee_ids`,
                    `organization_tag_ids`,
                    `manager_ids`,
                    `external_id`
                ]
            }
        ]
    },
    subscriptionName: COMMITTEE_LIST_SUBSCRIPTION
});

export const getCommitteeDetailSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewCommittee,
        ids: [id],
        fieldset: DEFAULT_FIELDSET,
        follow: [
            {
                idField: `user_ids`,
                fieldset: [],
                follow: [{ idField: `meeting_user_ids`, fieldset: `groups` }]
            },
            {
                idField: `meeting_ids`
            }
        ]
    },
    subscriptionName: COMMITTEE_DETAIL_SUBSCRIPTION
});

export const getCommitteeMeetingDetailSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        fieldset: [],
        additionalFields: [
            `default_meeting_for_committee_id`,
            `jitsi_domain`,
            `jitsi_room_name`,
            `jitsi_room_password`,
            `language`,
            `external_id`
        ],
        follow: [
            {
                idField: `admin_group_id`,
                fieldset: [
                    `name`,
                    `meeting_id`,
                    `admin_group_for_meeting_id`,
                    `default_group_for_meeting_id`,
                    `meeting_user_ids`
                ]
            },
            {
                idField: `default_group_id`,
                fieldset: [
                    `name`,
                    `meeting_id`,
                    `admin_group_for_meeting_id`,
                    `default_group_for_meeting_id`,
                    `meeting_user_ids`
                ]
            }
        ]
    },
    subscriptionName: MEETING_DETAIL_EDIT_SUBSCRIPTION,
    hideWhenDestroyed: true
});
