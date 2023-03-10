import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';

import { ViewPoll } from '../pages/polls';
import { pollModelRequest } from '../pages/polls/polls.subscription';

export const ACTIVE_POLLS_SUBSCRIPTION = `active_polls`;

export const getActivePollsSubscriptionConfig = (
    ids: Id[],
    getNextMeetingIdObservable: () => Observable<Id | null>
) => ({
    modelRequest: {
        viewModelCtor: ViewPoll,
        ids: ids,
        fieldset: DEFAULT_FIELDSET,
        ...pollModelRequest
    },
    subscriptionName: ACTIVE_POLLS_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});
