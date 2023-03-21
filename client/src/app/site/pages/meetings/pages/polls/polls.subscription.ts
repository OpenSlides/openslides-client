import { Id } from 'src/app/domain/definitions/key-types';
import { UserFieldsets } from 'src/app/domain/fieldsets/user';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';

import { ViewMeeting } from '../../view-models/view-meeting';

export const pollModelRequest = {
    follow: [
        { idField: `content_object_id` },
        { idField: `global_option_id` },
        {
            idField: `option_ids`,
            follow: [
                {
                    idField: `content_object_id`,
                    ...UserFieldsets.ShortNameSubscription
                },
                `vote_ids`
            ],
            additionalFields: [`text`]
        }
    ]
};

export const POLL_LIST_SUBSCRIPTION = `poll_list`;

export const getPollListSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [{ idField: `poll_ids`, ...pollModelRequest }]
    },
    subscriptionName: POLL_LIST_SUBSCRIPTION
});
