import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { listOfSpeakersSpeakerCountSubscription } from '../agenda/agenda.subscription';
import { pollModelRequest } from '../polls/polls.subscription';

export const ASSIGNMENT_LIST_SUBSCRIPTION = `assignment_list`;

export const getAssignmentSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `assignment_ids`,
                follow: [
                    { idField: `poll_ids`, ...pollModelRequest },
                    { idField: `list_of_speakers_id`, ...listOfSpeakersSpeakerCountSubscription }
                ]
            },
            {
                idField: `assignment_candidate_ids`,
                follow: [`user_id`]
            }
        ]
    },
    subscriptionName: ASSIGNMENT_LIST_SUBSCRIPTION
});

export const ASSIGNMENT_LIST_MINIMAL_SUBSCRIPTION = `assignment_list_minimal`;

export const getAssignmentListMinimalSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [{ idField: `assignment_ids`, fieldset: [`title`] }]
    },
    subscriptionName: ASSIGNMENT_LIST_MINIMAL_SUBSCRIPTION
});
