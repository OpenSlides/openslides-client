import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

const AGENDA_ITEM_SUBSCRIPTION = `agenda`;
const TOPIC_LIST_SUBSCRIPTION = `topic_list`;

export const getAgendaSubscriptionConfig = (id: Id, hasMeetingIdChangedObservable: () => Observable<boolean>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`agenda_item_ids`, `speaker_ids`, `list_of_speakers_ids`, `tag_ids`]
    },
    subscriptionName: AGENDA_ITEM_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});

export const getTopicSubscriptionConfig = (id: Id, hasMeetingIdChangedObservable: () => Observable<boolean>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`topic_ids`]
    },
    subscriptionName: TOPIC_LIST_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});
