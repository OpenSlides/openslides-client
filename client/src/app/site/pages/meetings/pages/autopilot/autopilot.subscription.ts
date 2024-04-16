import { Id } from 'src/app/domain/definitions/key-types';
import { FULL_FIELDSET, MEETING_ROUTING_FIELDS, mergeSubscriptionFollow } from 'src/app/domain/fieldsets/misc';
import { MeetingUserFieldsets, UserFieldsets } from 'src/app/domain/fieldsets/user';
import { SubscriptionConfig, SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { pollModelRequest } from '../polls/polls.subscription';
import { ViewProjection } from '../projectors';

export const AUTOPILOT_SUBSCRIPTION = `autopilot`;
export const AUTOPILOT_CONTENT_SUBSCRIPTION = `autopilot_content`;

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
                                fieldset: [`number`, `title`, `owner_id`, ...MEETING_ROUTING_FIELDS]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    subscriptionName: AUTOPILOT_SUBSCRIPTION
});

export const getAutopilotContentSubscriptionConfig = (id: Id): SubscriptionConfig<any> => ({
    modelRequest: {
        viewModelCtor: ViewProjection,
        ids: [id],
        follow: [
            {
                idField: `content_object_id`,
                fieldset: [`title`, `owner_id`, ...MEETING_ROUTING_FIELDS],
                follow: [
                    {
                        idField: `poll_ids`,
                        ...pollModelRequest
                    },
                    {
                        idField: `list_of_speakers_id`,
                        fieldset: [`closed`, ...MEETING_ROUTING_FIELDS],
                        follow: [
                            {
                                idField: `speaker_ids`,
                                fieldset: FULL_FIELDSET,
                                follow: [
                                    mergeSubscriptionFollow(
                                        {
                                            idField: `meeting_user_id`,
                                            follow: [
                                                mergeSubscriptionFollow(
                                                    { idField: `user_id`, ...UserFieldsets.FullNameSubscription },
                                                    {
                                                        idField: `user_id`,
                                                        fieldset: [`meeting_user_ids`]
                                                    }
                                                ),
                                                {
                                                    idField: `structure_level_ids`,
                                                    fieldset: [`name`, `color`]
                                                }
                                            ]
                                        },
                                        { idField: `meeting_user_id`, ...MeetingUserFieldsets.FullNameSubscription }
                                    ),
                                    {
                                        idField: `structure_level_list_of_speakers_id`,
                                        fieldset: FULL_FIELDSET
                                    }
                                ]
                            },
                            {
                                idField: `structure_level_list_of_speakers_ids`,
                                fieldset: FULL_FIELDSET
                            },
                            {
                                idField: `content_object_id`,
                                fieldset: [],
                                follow: [
                                    {
                                        idField: `agenda_item_id`,
                                        fieldset: [`item_number`, `moderator_notes`, `content_object_id`]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    subscriptionName: AUTOPILOT_CONTENT_SUBSCRIPTION
});
