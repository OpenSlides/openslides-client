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
                idField: `meeting_user_ids`,
                fieldset: [`group_ids`, `vote_delegations_from_ids`, `vote_weight`, `meeting_id`],
                follow: [
                    {
                        idField: `user_id`,
                        fieldset: [
                            `default_vote_weight`,
                            `is_physical_person`,
                            `is_active`,
                            `meeting_ids`,
                            `meeting_user_ids`,
                            `is_present_in_meeting_ids`
                        ]
                    },
                    {
                        idField: `vote_delegated_to_id`,
                        follow: [{ idField: `user_id`, fieldset: [`is_present_in_meeting_ids`, `meeting_user_ids`] }],
                        fieldset: [`meeting_id`]
                    }
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
                follow: [{ idField: `user_id`, additionalFields: [`is_present_in_meeting_ids`] }]
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
                follow: [
                    {
                        idField: `user_id`,
                        fieldset: `participantListMinimal`,
                        additionalFields: [`is_present_in_meeting_ids`]
                    }
                ]
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
        fieldset: DEFAULT_FIELDSET,
        follow: [
            {
                idField: `meeting_user_ids`,
                fieldset: DEFAULT_FIELDSET
            }
        ]
    },
    subscriptionName: PARTICIPANT_DETAIL_SUBSCRIPTION
});
