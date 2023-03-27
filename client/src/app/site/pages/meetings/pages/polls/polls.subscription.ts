import { Id } from 'src/app/domain/definitions/key-types';
import { FULL_FIELDSET, MEETING_ROUTING_FIELDS } from 'src/app/domain/fieldsets/misc';
import { UserFieldsets } from 'src/app/domain/fieldsets/user';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { BaseSimplifiedModelRequest } from 'src/app/site/services/model-request-builder';

import { ViewMeeting } from '../../view-models/view-meeting';

export const pollModelRequest: BaseSimplifiedModelRequest = {
    fieldset: FULL_FIELDSET,
    follow: [
        { idField: `content_object_id`, fieldset: [`title`, ...MEETING_ROUTING_FIELDS] },
        { idField: `global_option_id`, fieldset: FULL_FIELDSET },
        {
            idField: `option_ids`,
            fieldset: FULL_FIELDSET,
            follow: [
                {
                    idField: `content_object_id`,
                    ...UserFieldsets.FullNameSubscription,
                    follow: [
                        {
                            idField: `poll_candidate_ids`,
                            fieldset: FULL_FIELDSET,
                            follow: [{ idField: `user_id`, ...UserFieldsets.FullNameSubscription }]
                        }
                    ]
                },
                { idField: `vote_ids`, fieldset: FULL_FIELDSET }
            ]
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
