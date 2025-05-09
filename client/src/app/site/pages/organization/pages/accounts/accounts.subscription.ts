import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';

import { ViewMeeting } from '../../../meetings/view-models/view-meeting';
import { ViewUser } from '../../../meetings/view-models/view-user';

export const ACCOUNT_DETAIL_SUBSCRIPTION_NAME = `account_detail`;
export const MEETING_USER_IDS_SUBSCRIPTION_NAME = `meeting_user_ids`;

export const getAccountDetailSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewUser,
        ids: [id],
        fieldset: `all`,
        follow: [
            { idField: `committee_ids`, fieldset: [`name`, `manager_ids`] },
            {
                idField: `meeting_ids`,
                fieldset: [`name`, `committee_id`],
                follow: [{ idField: `group_ids`, fieldset: [`name`], isFullList: false }]
            },
            { idField: `gender_id`, fieldset: [`name`] },
            { idField: `home_committee_id`, fieldset: [`name`] }
        ]
    },
    subscriptionName: ACCOUNT_DETAIL_SUBSCRIPTION_NAME
});

export const getMeetingUserIdsSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        fieldset: [`name`, `user_ids`]
    },
    subscriptionName: MEETING_USER_IDS_SUBSCRIPTION_NAME
});
