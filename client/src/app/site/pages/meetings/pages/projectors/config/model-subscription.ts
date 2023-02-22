import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

const PROJECTOR_SUBSCRIPTION = `projector_list`;

export const getProjectorListSubscriptionConfig = (
    id: Id,
    hasMeetingIdChangedObservable: () => Observable<boolean>
) => ({
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
    subscriptionName: PROJECTOR_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});
