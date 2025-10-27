import { Id } from 'src/app/domain/definitions/key-types';
import { FULL_FIELDSET } from 'src/app/domain/fieldsets/misc';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { BaseSimplifiedModelRequest } from 'src/app/site/services/model-request-builder';

import { ViewMeeting } from '../../view-models/view-meeting';
import { ViewPoll } from './view-models';

export const POLL_LIST_SUBSCRIPTION = `poll_list`;
export const POLL_DETAIL_SUBSCRIPTION = `poll_detail`;

export const pollModelRequest: BaseSimplifiedModelRequest = {
    fieldset: FULL_FIELDSET,
    follow: []
};

export const getPollListSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [{ idField: `poll_ids`, ...pollModelRequest }]
    },
    subscriptionName: POLL_LIST_SUBSCRIPTION
});

export const getPollDetailSubscriptionConfig: SubscriptionConfigGenerator = (...ids: Id[]) => ({
    modelRequest: {
        viewModelCtor: ViewPoll,
        ids,
        fieldset: FULL_FIELDSET,
        follow: []
    },
    subscriptionName: `${POLL_DETAIL_SUBSCRIPTION}_${ids.join(`_`)}`
});
