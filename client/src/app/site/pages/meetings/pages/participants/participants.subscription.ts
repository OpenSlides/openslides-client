import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';

import { ViewUser } from '../../view-models/view-user';

export const PARTICIPANT_LIST_SUBSCRIPTION = `participant_list`;
export const PARTICIPANT_VOTE_INFO_SUBSCRIPTION = `participant_vote_info_list`;
export const PARTICIPANT_IS_PRESENT_LIST_SUBSCRIPTION = `participant_is_present_list`;
export const PARTICIPANT_LIST_SUBSCRIPTION_MINIMAL = `participant_list_minimal`;

export const getParticipantVoteInfoSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        fieldset: [],
        ids: [id],
        follow: [
            {
                idField: `user_ids`,
                fieldset: [
                    `default_vote_weight`,
                    `is_physical_person`,
                    `is_active`,
                    `meeting_ids`,
                    { templateField: `vote_delegated_$_to_id` },
                    { templateField: `vote_delegations_$_from_ids` },
                    { templateField: `vote_weight_$` },
                    { templateField: `group_$_ids` },
                    `is_present_in_meeting_ids`
                ]
            }
        ]
    },
    subscriptionName: PARTICIPANT_VOTE_INFO_SUBSCRIPTION
});

export const getParticipantIsPresentSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        fieldset: [],
        ids: [id],
        follow: [
            {
                idField: `meeting_user_ids`,
                follow: [{ idField: `user_ids`, additionalFields: [`is_present_in_meeting_ids`] }]
            }
        ]
    },
    subscriptionName: PARTICIPANT_IS_PRESENT_LIST_SUBSCRIPTION
});

export const getParticipantListSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `meeting_user_ids`,
                fieldset: `participantListMinimal`,
                follow: [{ idField: `user_id`, fieldset: `participantList` }]
            }
        ]
    },
    subscriptionName: PARTICIPANT_LIST_SUBSCRIPTION
});

export const getParticipantMinimalSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `meeting_user_ids`,
                fieldset: `participantListMinimal`,
                follow: [{ idField: `user_id`, fieldset: `participantListMinimal` }]
            }
        ]
    },
    subscriptionName: PARTICIPANT_LIST_SUBSCRIPTION_MINIMAL
});

export const PARTICIPANT_DETAIL_SUBSCRIPTION = `participant_detail`;

export const getParticipantDetailSubscription: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewUser,
        ids: [id],
        fieldset: DEFAULT_FIELDSET
    },
    subscriptionName: PARTICIPANT_DETAIL_SUBSCRIPTION
});
