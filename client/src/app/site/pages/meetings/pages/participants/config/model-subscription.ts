import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

const PARTICIPANT_LIST_SUBSCRIPTION = `participant_list`;

export const getParticipantSubscriptionConfig = (id: Id, hasMeetingIdChangedObservable: () => Observable<boolean>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [{ idField: `user_ids`, fieldset: `participantList` }]
    },
    subscriptionName: PARTICIPANT_LIST_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});
