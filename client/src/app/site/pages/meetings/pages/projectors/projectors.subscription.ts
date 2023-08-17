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
    `owner_id`
];

export const PROJECTOR_LIST_SUBSCRIPTION = `projector_list`;

export const getProjectorListSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `projector_ids`,
                follow: [
                    {
                        idField: `current_projection_ids`,
                        fieldset: FULL_FIELDSET,
                        follow: [{ idField: `content_object_id`, fieldset: projectionContentObjectFieldset }]
                    },
                    {
                        idField: `preview_projection_ids`,
                        follow: [{ idField: `content_object_id`, fieldset: projectionContentObjectFieldset }]
                    },
                    {
                        idField: `history_projection_ids`,
                        follow: [{ idField: `content_object_id`, fieldset: projectionContentObjectFieldset }]
                    }
                ]
            },
            `projector_countdown_ids`,
            `projector_message_ids`,
            ...MEETING_DEFAULT_PROJECTOR_IDS_KEYS,
            { idField: `speaker_ids`, additionalFields: [`meeting_user_id`] },
            `list_of_speakers_ids`
        ],
        additionalFields: [`reference_projector_id`]
    },
    subscriptionName: PROJECTOR_LIST_SUBSCRIPTION
});

export const PROJECTOR_LIST_MINIMAL_SUBSCRIPTION = `projector_list`;

export const getProjectorListMinimalSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`projector_ids`, ...MEETING_DEFAULT_PROJECTOR_IDS_KEYS],
        additionalFields: [`reference_projector_id`]
    },
    subscriptionName: PROJECTOR_LIST_MINIMAL_SUBSCRIPTION
});

export const PROJECTOR_SUBSCRIPTION = `projector_detail`;

export const getProjectorSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewProjector,
        ids: [id],
        fieldset: DEFAULT_FIELDSET,
        follow: [
            {
                idField: `current_projection_ids`,
                fieldset: FULL_FIELDSET,
                follow: [{ idField: `content_object_id`, fieldset: projectionContentObjectFieldset }]
            }
        ]
    },
    subscriptionName: PROJECTOR_SUBSCRIPTION
});
