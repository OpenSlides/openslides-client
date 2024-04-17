import { Id } from 'src/app/domain/definitions/key-types';
import { MeetingUserFieldsets } from 'src/app/domain/fieldsets/user';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { listOfSpeakersSpeakerCountSubscription } from '../agenda/agenda.subscription';
import { pollModelRequest } from '../polls/polls.subscription';

export const ASSIGNMENT_LIST_SUBSCRIPTION = `assignment_list`;
export const ASSIGNMENT_LIST_MINIMAL_SUBSCRIPTION = `assignment_list_minimal`;

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
                follow: [{ idField: `meeting_user_id`, ...MeetingUserFieldsets.FullNameSubscription }]
            }
        ]
    },
    subscriptionName: ASSIGNMENT_LIST_SUBSCRIPTION
});

export const getAssignmentListMinimalSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [{ idField: `assignment_ids`, fieldset: [`title`] }]
    },
    subscriptionName: ASSIGNMENT_LIST_MINIMAL_SUBSCRIPTION
});
