import { Id } from 'src/app/domain/definitions/key-types';
import { FULL_FIELDSET } from 'src/app/domain/fieldsets/misc';
import { MeetingUserFieldsets } from 'src/app/domain/fieldsets/user';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { listOfSpeakersSpeakerCountSubscription } from '../agenda/agenda.subscription';
import { pollModelRequest } from '../polls/polls.subscription';
import { ViewAssignment } from './view-models';

export const ASSIGNMENT_LIST_SUBSCRIPTION = `assignment_list`;
export const ASSIGNMENT_LIST_MINIMAL_SUBSCRIPTION = `assignment_list_minimal`;
export const ASSIGNMENT_DETAIL_SUBSCRIPTION = `assignment_detail`;

export const getAssignmentSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `assignment_ids`,
                follow: [
                    { idField: `list_of_speakers_id`, ...listOfSpeakersSpeakerCountSubscription },
                    {
                        idField: `candidate_ids`,
                        fieldset: []
                    }
                ]
            }
        ]
    },
    subscriptionName: ASSIGNMENT_LIST_SUBSCRIPTION
});

export const getAssignmentDetailSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewAssignment,
        ids: [id],
        fieldset: FULL_FIELDSET,
        follow: [
            {
                idField: `attachment_meeting_mediafile_ids`,
                fieldset: FULL_FIELDSET,
                follow: [{ idField: `mediafile_id`, fieldset: FULL_FIELDSET }]
            },
            { idField: `poll_ids`, ...pollModelRequest },
            { idField: `list_of_speakers_id`, ...listOfSpeakersSpeakerCountSubscription },
            {
                idField: `candidate_ids`,
                fieldset: [`weight`],
                follow: [{ idField: `meeting_user_id`, ...MeetingUserFieldsets.FullNameSubscription }]
            }
        ]
    },
    subscriptionName: ASSIGNMENT_DETAIL_SUBSCRIPTION
});

export const getAssignmentListMinimalSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [{ idField: `assignment_ids`, fieldset: [`title`] }]
    },
    subscriptionName: ASSIGNMENT_LIST_MINIMAL_SUBSCRIPTION
});
