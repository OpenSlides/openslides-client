import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { agendaItemFollow } from '../agenda/agenda.subscription';

export const AUTOPILOT_SUBSCRIPTION = `autopilot`;

export const getAutopilotSubscriptionConfig = (id: Id, hasMeetingIdChangedObservable: () => Observable<boolean>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `reference_projector_id`,
                follow: [
                    {
                        idField: `current_projection_ids`,
                        fieldset: `content`,
                        follow: [
                            {
                                idField: `content_object_id`,
                                follow: [...agendaItemFollow]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    subscriptionName: AUTOPILOT_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});
