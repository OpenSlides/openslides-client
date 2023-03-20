import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfigGenerator } from 'src/app/domain/interfaces/subscription-config';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';

import { ViewProjector } from './view-models';

export const PROJECTOR_LIST_SUBSCRIPTION = `projector_list`;

export const getProjectorListSubscriptionConfig: SubscriptionConfigGenerator = (id: Id) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            {
                idField: `projector_ids`,
                follow: [
                    { idField: `current_projection_ids`, fieldset: `content`, follow: [`content_object_id`] },
                    { idField: `preview_projection_ids`, follow: [`content_object_id`] },
                    { idField: `history_projection_ids`, follow: [`content_object_id`] }
                ]
            },
            `projector_countdown_ids`,
            `projector_message_ids`,
            `default_projector_$_ids`,
            { idField: `speaker_ids`, additionalFields: [`user_id`] },
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
        follow: [`projector_ids`, `default_projector_$_ids`],
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
        follow: [{ idField: `current_projection_ids`, fieldset: `content`, follow: [`content_object_id`] }]
    },
    subscriptionName: PROJECTOR_SUBSCRIPTION
});
