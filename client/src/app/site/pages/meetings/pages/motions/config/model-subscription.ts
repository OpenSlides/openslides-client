import { Id } from 'src/app/domain/definitions/key-types';
import { Observable, map } from 'rxjs';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

const MOTION_LIST_SUBSCRIPTION = `motion_list`;

export const getMotionSubscriptionConfig = (id: Id, getNextMeetingIdObservable: () => Observable<Id | null>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            `motion_ids`,
            `motion_block_ids`,
            `motion_category_ids`,
            `motion_workflow_ids`,
            `motion_state_ids`,
            `motion_submitter_ids`,
            `motion_change_recommendation_ids`,
            `motion_comment_ids`,
            `motion_comment_section_ids`,
            `tag_ids`,
            `personal_note_ids`
        ]
    },
    subscriptionName: MOTION_LIST_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});
