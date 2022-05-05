import { Id } from 'src/app/domain/definitions/key-types';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { map, Observable } from 'rxjs';

const PROJECTOR_SUBSCRIPTION = `projector_list`;

export const getProjectorListSubscriptionConfig = (
    id: Id,
    getNextMeetingIdObservable: () => Observable<Id | null>
) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            `projector_ids`,
            { idField: `projection_ids`, follow: [`content_object_id`] },
            { idField: `all_projection_ids`, follow: [`content_object_id`] },
            `projector_countdown_ids`,
            `projector_message_ids`,
            `default_projector_$_id`,
            {
                idField: `reference_projector_id`,
                follow: [{ idField: `current_projection_ids`, follow: [`content_object_id`] }]
            },
            { idField: `speaker_ids`, additionalFields: [`user_id`] },
            `list_of_speakers_ids`
        ]
    },
    subscriptionName: PROJECTOR_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});
