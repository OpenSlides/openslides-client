import { Id } from 'src/app/domain/definitions/key-types';

import { ViewUser } from '../../../meetings/view-models/view-user';

export const ACCOUNT_DETAIL_SUBSCRIPTION_NAME = `account_detail`;

export const getAccountDetailSubscriptionConfig = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewUser,
        ids: [id],
        fieldset: `accountList`,
        follow: [
            `committee_ids`,
            { idField: `meeting_ids`, additionalFields: [`committee_id`] } // , `committee_$_management_level`
        ]
    },
    subscriptionName: ACCOUNT_DETAIL_SUBSCRIPTION_NAME,
    hideWhenDestroyed: true
});
