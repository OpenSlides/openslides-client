import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { MEETING_DEFAULT_PROJECTOR_IDS_KEYS } from 'src/app/domain/models/meetings/meeting.constants';
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
            ...MEETING_DEFAULT_PROJECTOR_IDS_KEYS,
            { idField: `speaker_ids`, additionalFields: [`meeting_user_id`] },
            `list_of_speakers_ids`
        ],
        additionalFields: [`reference_projector_id`]
    },
    subscriptionName: PROJECTOR_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});
