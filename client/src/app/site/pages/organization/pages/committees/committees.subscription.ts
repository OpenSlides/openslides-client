import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';

import { ViewMeeting } from '../../../meetings/view-models/view-meeting';
import { ViewCommittee } from './view-models';

export const COMMITTEE_LIST_SUBSCRIPTION = `committee_list`;

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

export const COMMITTEE_DETAIL_SUBSCRIPTION = `committee_detail`;

export const getCommitteeDetailSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    hideWhenDestroyed: true,
    modelRequest: {
        viewModelCtor: ViewCommittee,
        ids: [id],
        fieldset: DEFAULT_FIELDSET,
        follow: [
            {
                idField: `user_ids`,
                fieldset: `accountList`,
                additionalFields: [{ templateField: `group_$_ids` }]
            }
        ]
    },
    subscriptionName: COMMITTEE_DETAIL_SUBSCRIPTION
});

const MEETING_DETAIL_EDIT_SUBSCRIPTION = `committee_meeting_detail`;

export const getCommitteeMeetingDetailSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        fieldset: [],
        additionalFields: [
            `is_template`,
            `default_meeting_for_committee_id`,
            `jitsi_domain`,
            `jitsi_room_name`,
            `jitsi_room_password`,
            `language`
        ],
        follow: [`admin_group_id`, `default_group_id`]
    },
    subscriptionName: MEETING_DETAIL_EDIT_SUBSCRIPTION,
    hideWhenDestroyed: true
});
