import { Id } from 'src/app/domain/definitions/key-types';
import { FULL_FIELDSET, MEETING_ROUTING_FIELDS } from 'src/app/domain/fieldsets/misc';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { agendaItemFollow } from '../agenda/agenda.subscription';

export const AUTOPILOT_SUBSCRIPTION = `autopilot`;

export const getAutopilotSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `reference_projector_id`,
                fieldset: FULL_FIELDSET,
                follow: [
                    {
                        idField: `current_projection_ids`,
                        fieldset: FULL_FIELDSET,
                        follow: [
                            {
                                idField: `content_object_id`,
                                fieldset: [`title`, `owner_id`, ...MEETING_ROUTING_FIELDS],
                                follow: [...agendaItemFollow]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    subscriptionName: AUTOPILOT_SUBSCRIPTION
});
