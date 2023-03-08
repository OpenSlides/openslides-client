import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

const AGENDA_LIST_ITEM_SUBSCRIPTION = `agenda_list`;

export const getAgendaListSubscriptionConfig = (id: Id, hasMeetingIdChangedObservable: () => Observable<boolean>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `agenda_item_ids`,
                follow: [
                    {
                        idField: `content_object_id`,
                        follow: [{ idField: `list_of_speakers_id`, follow: [`speaker_ids`] }]
                    }
                ]
            },
            `tag_ids`
        ]
    },
    subscriptionName: AGENDA_LIST_ITEM_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});
