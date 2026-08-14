import { Id } from '@app/domain/definitions/key-types';
import { SubscriptionConfigGenerator } from '@app/domain/interfaces/subscription-config';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { DEFAULT_FIELDSET } from '@app/site/services/model-request-builder';

import { pollModelRequest } from '../pages/polls/polls.subscription';

export const ACTIVE_POLLS_SUBSCRIPTION = `active_polls`;

export const getActivePollsSubscriptionConfig: SubscriptionConfigGenerator = (...ids: Id[]) => ({
    modelRequest: {
        viewModelCtor: ViewPoll,
        ids: ids,
        fieldset: DEFAULT_FIELDSET,
        ...pollModelRequest
    },
    subscriptionName: ACTIVE_POLLS_SUBSCRIPTION
});
