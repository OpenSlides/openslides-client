import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

const PARTICIPANT_LIST_SUBSCRIPTION = `participant_list`;
const PARTICIPANT_IS_PRESENT_LIST_SUBSCRIPTION = `participant_is_present_list`;
const PARTICIPANT_LIST_SUBSCRIPTION_MINIMAL = `participant_list_minimal`;

export const getParticipantIsPresentSubscriptionConfig = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        fieldset: [],
        ids: [id],
        follow: [
            {
                idField: `meeting_user_ids`,
                follow: [{ idField: `user_id`, additionalFields: [`is_present_in_meeting_ids`] }]
            }
        ]
    },
    subscriptionName: PARTICIPANT_IS_PRESENT_LIST_SUBSCRIPTION
});

export const getParticipantSubscriptionConfig = (id: Id, hasMeetingIdChangedObservable: () => Observable<boolean>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `meeting_user_ids`,
                fieldset: `participantListMinimal`,
                follow: [{ idField: `user_id`, fieldset: `participantList` }]
            }
        ]
    },
    subscriptionName: PARTICIPANT_LIST_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});

export const getParticipantMinimalSubscriptionConfig = (
    id: Id,
    hasMeetingIdChangedObservable: () => Observable<boolean>
) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `meeting_user_ids`,
                fieldset: `participantListMinimal`,
                follow: [{ idField: `user_id`, fieldset: `participantListMinimal` }]
            }
        ]
    },
    subscriptionName: PARTICIPANT_LIST_SUBSCRIPTION_MINIMAL,
    hideWhen: hasMeetingIdChangedObservable()
});
