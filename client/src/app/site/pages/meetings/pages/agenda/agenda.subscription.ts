import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { pollModelRequest } from '../polls/polls.subscription';

export const AGENDA_LIST_ITEM_SUBSCRIPTION = `agenda_list`;

export const agendaItemFollow = [
    {
        idField: `list_of_speakers_id`,
        follow: [
            {
                idField: `speaker_ids`,
                follow: [
                    {
                        idField: `user_id`,
                        fieldset: [
                            `pronoun`,
                            `first_name`,
                            `last_name`,
                            `username`,
                            { templateField: `number_$` },
                            { templateField: `structure_level_$` }
                        ]
                    }
                ]
            }
        ]
    },
    {
        idField: `poll_ids`,
        ...pollModelRequest
    },
    `attachment_ids`
];

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
                        follow: [...agendaItemFollow]
                    }
                ]
            },

            `tag_ids`
        ]
    },
    subscriptionName: AGENDA_LIST_ITEM_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});
