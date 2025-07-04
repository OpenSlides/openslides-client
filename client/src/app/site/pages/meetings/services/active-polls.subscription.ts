import { Id } from 'src/app/domain/definitions/key-types';
import { FULL_FIELDSET } from 'src/app/domain/fieldsets/misc';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';

import { ViewPoll } from '../pages/polls';
import { pollModelRequest } from '../pages/polls/polls.subscription';

export const ACTIVE_POLLS_SUBSCRIPTION = `active_polls`;

export const getActivePollsSubscriptionConfig: SubscriptionConfigGenerator = (...ids: Id[]) => ({
    modelRequest: {
        viewModelCtor: ViewPoll,
        ids: ids,
        fieldset: FULL_FIELDSET,
        ...pollModelRequest
    },
    subscriptionName: ACTIVE_POLLS_SUBSCRIPTION
});
