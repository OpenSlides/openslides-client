import { Id } from 'src/app/domain/definitions/key-types';
import { FULL_FIELDSET, MEETING_ROUTING_FIELDS, mergeSubscriptionFollow } from 'src/app/domain/fieldsets/misc';
import { MeetingUserFieldsets } from 'src/app/domain/fieldsets/user';
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
                                fieldset: [`number`, `title`, `mediafile_id`, ...MEETING_ROUTING_FIELDS]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    subscriptionName: AUTOPILOT_SUBSCRIPTION
});

const speakersFields = {
    idField: `speaker_ids`,
    fieldset: FULL_FIELDSET,
    follow: [
        mergeSubscriptionFollow(
            {
                idField: `meeting_user_id`,
                follow: [
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
};

export const getAutopilotContentSubscriptionConfig = (id: Id): SubscriptionConfig<any> => ({
    modelRequest: {
        viewModelCtor: ViewProjection,
        ids: [id],
        follow: [
            {
                idField: `content_object_id`,
                fieldset: [`title`, `owner_id`, `closed`, `moderator_notes`, ...MEETING_ROUTING_FIELDS],
                follow: [
                    {
                        idField: `mediafile_id`,
                        fieldset: [`title`, `mimetype`, `owner_id`]
                    },
                    {
                        idField: `poll_ids`,
                        ...pollModelRequest
                    },
                    speakersFields,
                    {
                        idField: `content_object_id`,
                        fieldset: [`title`]
                    },
                    {
                        idField: `list_of_speakers_id`,
                        fieldset: [`closed`, `moderator_notes`, ...MEETING_ROUTING_FIELDS],
                        follow: [
                            speakersFields,
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
                                        fieldset: [`item_number`, `content_object_id`]
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
