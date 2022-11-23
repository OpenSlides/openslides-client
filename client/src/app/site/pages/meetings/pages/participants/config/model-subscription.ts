import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

const PARTICIPANT_LIST_SUBSCRIPTION = `participant_list`;
const PARTICIPANT_LIST_SUBSCRIPTION_MINIMAL = `participant_list_minimal`;

export const getParticipantSubscriptionConfig = (id: Id, hasMeetingIdChangedObservable: () => Observable<boolean>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [{ idField: `user_ids`, fieldset: `participantListMinimal` }]
    },
    subscriptionName: PARTICIPANT_LIST_SUBSCRIPTION_MINIMAL,
    hideWhen: hasMeetingIdChangedObservable()
});

export const getParticipantListSubscriptionConfig = (
    id: Id,
    hasMeetingIdChangedObservable: () => Observable<boolean>
) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [{ idField: `user_ids`, fieldset: `participantList` }]
    },
    subscriptionName: PARTICIPANT_LIST_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});
