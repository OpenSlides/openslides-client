import 'src/app/site/services/model-request-builder';

import { Id } from 'src/app/domain/definitions/key-types';
import { FULL_FIELDSET, MEETING_ROUTING_FIELDS } from 'src/app/domain/fieldsets/misc';
import { UserFieldsets } from 'src/app/domain/fieldsets/user';
import { MEETING_MEDIAFILE_USAGE_ID_KEYS } from 'src/app/domain/models/meetings/meeting.constants';

import { ViewMeeting } from '../view-models/view-meeting';

export const ACTIVE_MEETING_SUBSCRIPTION = `active_meeting`;

export function getActiveMeetingSubscriptionConfig(id: Id, settingsKeys: string[] = []) {
    return {
        modelRequest: {
            viewModelCtor: ViewMeeting,
            ids: [id],
            fieldset: [
                `name`,
                `start_time`,
                `end_time`,
                `is_active_in_organization_id`,
                `template_for_organization_id`,
                `user_ids`,
                `description`,
                `location`,
                `language`,
                `organization_tag_ids`,
                `welcome_title`,
                `welcome_text`,
                `enable_anonymous`,
                ...MEETING_MEDIAFILE_USAGE_ID_KEYS,
                ...settingsKeys
            ],
            follow: [
                { idField: `chat_group_ids` /*, fieldset: [`chat_message_ids`]*/ },
                {
                    idField: `chat_message_ids`,
                    follow: [
                        {
                            idField: `meeting_user_id`,
                            fieldset: [],
                            follow: [
                                {
                                    idField: `user_id`,
                                    ...UserFieldsets.FullNameSubscription
                                }
                            ]
                        }
                    ]
                }, // TODO: Remove and count unread messages by chat_group_ids/chat_message_ids
                {
                    idField: `poll_ids`,
                    follow: [{ idField: `content_object_id`, fieldset: [`title`] }],
                    fieldset: [`title`, `state`, `entitled_group_ids`]
                },
                {
                    idField: `point_of_order_category_ids`,
                    fieldset: FULL_FIELDSET
                },
                {
                    idField: `group_ids`,
                    fieldset: [
                        `admin_group_for_meeting_id`,
                        `default_group_for_meeting_id`,
                        `name`,
                        `permissions`,
                        `weight`,
                        `external_id`
                    ]
                },
                {
                    idField: `projector_ids`,
                    fieldset: [`name`],
                    follow: [{ idField: `current_projection_ids`, fieldset: [`content_object_id`] }]
                },
                {
                    idField: `reference_projector_id`,
                    fieldset: [`used_as_reference_projector_meeting_id`],
                    follow: [
                        {
                            idField: `current_projection_ids`,
                            fieldset: [],
                            follow: [
                                {
                                    idField: `content_object_id`,
                                    fieldset: [],
                                    follow: [
                                        {
                                            idField: `list_of_speakers_id`,
                                            fieldset: MEETING_ROUTING_FIELDS,
                                            follow: [
                                                {
                                                    idField: `speaker_ids`,
                                                    fieldset: [`begin_time`, `end_time`, `weight`],
                                                    follow: [
                                                        {
                                                            idField: `meeting_user_id`,
                                                            fieldset: [`user_id`]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            additionalFields: [
                `jitsi_domain`,
                `jitsi_room_name`,
                `jitsi_room_password`,
                `admin_group_id`,
                `default_group_id`
            ]
        },
        subscriptionName: ACTIVE_MEETING_SUBSCRIPTION
    };
}
