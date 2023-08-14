import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';

import { ViewUser } from '../../../meetings/view-models/view-user';

export const ACCOUNT_DETAIL_SUBSCRIPTION_NAME = `account_detail`;

export const getAccountDetailSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewUser,
        ids: [id],
        fieldset: `all`,
        follow: [
            { idField: `committee_ids`, fieldset: [`name`, `manager_ids`] },
            {
                idField: `meeting_ids`,
                follow: [{ idField: `group_ids`, fieldset: [`name`] }],
                fieldset: [`name`, `committee_id`]
            }
        ]
    },
    subscriptionName: ACCOUNT_DETAIL_SUBSCRIPTION_NAME
});
