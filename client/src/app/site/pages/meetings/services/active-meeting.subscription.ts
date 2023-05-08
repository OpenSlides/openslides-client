import 'src/app/site/services/model-request-builder';

import { Id } from 'src/app/domain/definitions/key-types';
import { MEETING_ROUTING_FIELDS } from 'src/app/domain/fieldsets/misc';

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
                `is_archived_organization_id`,
                `template_for_organization_id`,
                `user_ids`,
                `description`,
                `location`,
                `language`,
                `organization_tag_ids`,
                `welcome_title`,
                `welcome_text`,
                `enable_anonymous`,
                { templateField: `logo_$_id` },
                { templateField: `font_$_id` },
                ...settingsKeys
            ],
            follow: [
                { idField: `chat_group_ids` /*, fieldset: [`chat_message_ids`]*/ },
                `chat_message_ids`, // TODO: Remove and count unread messages by chat_group_ids/chat_message_ids
                {
                    idField: `poll_ids`,
                    follow: [{ idField: `content_object_id`, fieldset: [`title`] }],
                    fieldset: [`title`, `state`, `entitled_group_ids`]
                },
                {
                    idField: `group_ids`,
                    fieldset: [
                        `admin_group_for_meeting_id`,
                        `default_group_for_meeting_id`,
                        `name`,
                        `permissions`,
                        `weight`
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
                                                    fieldset: [`user_id`, `begin_time`, `end_time`, `weight`]
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
