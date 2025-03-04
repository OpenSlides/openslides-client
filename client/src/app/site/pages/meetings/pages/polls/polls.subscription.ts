import { Id } from 'src/app/domain/definitions/key-types';
import { FULL_FIELDSET, MEETING_ROUTING_FIELDS } from 'src/app/domain/fieldsets/misc';
import { MeetingUserFieldsets, UserFieldsets } from 'src/app/domain/fieldsets/user';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { BaseSimplifiedModelRequest } from 'src/app/site/services/model-request-builder';

import { ViewMeeting } from '../../view-models/view-meeting';
import { ViewPoll } from './view-models';

export const POLL_LIST_SUBSCRIPTION = `poll_list`;
export const POLL_DETAIL_SUBSCRIPTION = `poll_detail`;

export const pollModelRequest: BaseSimplifiedModelRequest = {
    fieldset: FULL_FIELDSET,
    follow: [
        {
            idField: `content_object_id`,
            fieldset: [`title`, ...MEETING_ROUTING_FIELDS],
            follow: [
                {
                    idField: `candidate_ids`,
                    fieldset: FULL_FIELDSET,
                    follow: [{ idField: `meeting_user_id`, ...MeetingUserFieldsets.FullNameSubscription }]
                }
            ]
        },
        { idField: `global_option_id`, fieldset: FULL_FIELDSET },
        {
            idField: `option_ids`,
            fieldset: FULL_FIELDSET,
            follow: [
                {
                    idField: `content_object_id`,
                    fieldset: [...UserFieldsets.FullNameSubscription.fieldset, `option_ids`],
                    follow: [
                        {
                            idField: `poll_candidate_ids`,
                            fieldset: FULL_FIELDSET,
                            follow: [{ idField: `user_id`, ...UserFieldsets.FullNameSubscription }]
                        }
                    ]
                },
                { idField: `vote_ids`, fieldset: FULL_FIELDSET }
            ]
        }
    ]
};

export const getPollListSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [{ idField: `poll_ids`, ...pollModelRequest }]
    },
    subscriptionName: POLL_LIST_SUBSCRIPTION
});

export const getPollDetailSubscriptionConfig: SubscriptionConfigGenerator = (...ids: Id[]) => ({
    modelRequest: {
        viewModelCtor: ViewPoll,
        ids,
        fieldset: FULL_FIELDSET,
        follow: [
            { idField: `content_object_id`, fieldset: [`title`, ...MEETING_ROUTING_FIELDS] },
            {
                idField: `option_ids`,
                fieldset: FULL_FIELDSET,
                follow: [
                    {
                        idField: `content_object_id`,
                        ...UserFieldsets.FullNameSubscription,
                        follow: [
                            {
                                idField: `poll_candidate_ids`,
                                fieldset: FULL_FIELDSET,
                                follow: [{ idField: `user_id`, ...UserFieldsets.FullNameSubscription }]
                            }
                        ]
                    },
                    { idField: `vote_ids`, fieldset: FULL_FIELDSET }
                ]
            },
            {
                idField: `global_option_id`,
                fieldset: FULL_FIELDSET,
                follow: [{ idField: `vote_ids` }]
            },
            {
                idField: `entitled_group_ids`,
                fieldset: [],
                follow: [
                    {
                        idField: `meeting_user_ids`,
                        fieldset: [`user_id`]
                    }
                ]
            }
        ]
    },
    subscriptionName: `${POLL_DETAIL_SUBSCRIPTION}_${ids.join(`_`)}`
});
