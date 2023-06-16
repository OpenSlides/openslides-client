import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';

import { ViewMeeting } from '../../view-models/view-meeting';

export const LOS_FIRST_CONTRIBUTION_SUBSCRIPTION = `los_first_contribution`;

export const getLosFirstContributionSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [{ idField: `speaker_ids`, fieldset: [`meeting_user_id`, `state`] }]
    },
    subscriptionName: LOS_FIRST_CONTRIBUTION_SUBSCRIPTION
});
