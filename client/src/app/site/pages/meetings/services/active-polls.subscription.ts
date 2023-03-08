import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';

import { ViewPoll } from '../pages/polls';

export const ACTIVE_POLLS_SUBSCRIPTION = `active_polls`;

export const getActivePollsSubscriptionConfig = (
    ids: Id[],
    getNextMeetingIdObservable: () => Observable<Id | null>
) => ({
    modelRequest: {
        viewModelCtor: ViewPoll,
        ids: ids,
        fieldset: DEFAULT_FIELDSET,
        follow: [
            { idField: `content_object_id` },
            {
                idField: `option_ids`,
                follow: [
                    {
                        idField: `content_object_id`,
                        fieldset: [
                            `title`,
                            `pronoun`,
                            `first_name`,
                            `last_name`,
                            `username`,
                            { templateField: `number_$` },
                            { templateField: `structure_level_$` }
                        ]
                    }
                ],
                additionalFields: [`text`]
            }
        ]
    },
    subscriptionName: ACTIVE_POLLS_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});
