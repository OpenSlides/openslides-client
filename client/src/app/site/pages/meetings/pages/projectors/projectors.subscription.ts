import { Id } from 'src/app/domain/definitions/key-types';
import { FULL_FIELDSET } from 'src/app/domain/fieldsets/misc';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { MEETING_DEFAULT_PROJECTOR_IDS_KEYS } from 'src/app/domain/models/meetings/meeting.constants';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';

import { ViewProjector } from './view-models';

export const projectionContentObjectFieldset = [
    `number`,
    `name`,
    `title`,
    `meeting_id`,
    `sequential_number`,
    `agenda_item_id`
];

export const PROJECTOR_LIST_SUBSCRIPTION = `projector_list`;
export const PROJECTOR_LIST_MINIMAL_SUBSCRIPTION = `projector_list_minimal`;
export const PROJECTOR_SUBSCRIPTION = `projector_detail`;

export const getProjectorListSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        additionalFields: [`reference_projector_id`],
        follow: [
            {
                idField: `projector_ids`,
                follow: [
                    {
                        idField: `current_projection_ids`,
                        fieldset: FULL_FIELDSET,
                        follow: [
                            {
                                idField: `content_object_id`,
                                fieldset: projectionContentObjectFieldset,
                                follow: [
                                    {
                                        idField: `mediafile_id`,
                                        fieldset: [`owner_id`, `pdf_information`, `title`, `mimetype`]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        idField: `preview_projection_ids`,
                        follow: [
                            {
                                idField: `content_object_id`,
                                fieldset: projectionContentObjectFieldset,
                                follow: [{ idField: `mediafile_id`, fieldset: [`owner_id`, `title`] }]
                            }
                        ]
                    },
                    {
                        idField: `history_projection_ids`,
                        follow: [
                            {
                                idField: `content_object_id`,
                                fieldset: projectionContentObjectFieldset,
                                follow: [{ idField: `mediafile_id`, fieldset: [`owner_id`, `title`] }]
                            }
                        ]
                    }
                ]
            },
            { idField: `projector_countdown_ids` },
            { idField: `projector_message_ids` },
            { idField: `speaker_ids`, additionalFields: [`meeting_user_id`] },
            { idField: `list_of_speakers_ids` },
            { idField: `agenda_item_ids`, fieldset: [`item_number`, `content_object_id`] },
            ...MEETING_DEFAULT_PROJECTOR_IDS_KEYS
        ]
    },
    subscriptionName: PROJECTOR_LIST_SUBSCRIPTION
});

export const getProjectorListMinimalSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`projector_ids`, ...MEETING_DEFAULT_PROJECTOR_IDS_KEYS],
        additionalFields: [`reference_projector_id`]
    },
    subscriptionName: PROJECTOR_LIST_MINIMAL_SUBSCRIPTION
});

export const getProjectorSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewProjector,
        ids: [id],
        fieldset: DEFAULT_FIELDSET,
        follow: [
            {
                idField: `current_projection_ids`,
                fieldset: FULL_FIELDSET,
                follow: [
                    {
                        idField: `content_object_id`,
                        fieldset: projectionContentObjectFieldset,
                        follow: [{ idField: `mediafile_id`, fieldset: [`owner_id`, `title`] }]
                    }
                ]
            }
        ]
    },
    subscriptionName: PROJECTOR_SUBSCRIPTION
});
