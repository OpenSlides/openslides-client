import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';

import { ViewMeeting } from '../../view-models/view-meeting';

export const LOS_FIRST_CONTRIBUTION_SUBSCRIPTION = `los_first_contribution`;

export const getLosFirstContributionSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `list_of_speakers_ids`,
                fieldset: [],
                follow: [
                    {
                        idField: `speaker_ids`,
                        fieldset: [`meeting_user_id`, `speech_state`, `begin_time`, `end_time`]
                    }
                ]
            }
        ]
    },
    subscriptionName: LOS_FIRST_CONTRIBUTION_SUBSCRIPTION
});
