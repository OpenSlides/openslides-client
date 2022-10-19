import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

const MOTION_LIST_SUBSCRIPTION = `motion_list`;
const MOTION_BLOCK_SUBSCRIPTION = `motion_block`;
const MOTION_WORKFLOW_SUBSCRIPTION = `motion_workflow`;
const MOTION_SUBMODELS_SUBSCRIPTION = `motion_submodels`;

export const getMotionListSubscriptionConfig = (id: Id, hasMeetingIdChangedObservable: () => Observable<boolean>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`motion_ids`],
        additionalFields: [`origin_id`, `origin_meeting_id`, `derived_motion_ids`]
    },
    subscriptionName: MOTION_LIST_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});

export const getMotionBlockSubscriptionConfig = (id: Id, hasMeetingIdChangedObservable: () => Observable<boolean>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [{ idField: `motion_block_ids`, follow: [`list_of_speakers_id`] }]
    },
    subscriptionName: MOTION_BLOCK_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});

export const getMotionWorkflowSubscriptionConfig = (
    id: Id,
    hasMeetingIdChangedObservable: () => Observable<boolean>
) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`motion_workflow_ids`]
    },
    subscriptionName: MOTION_WORKFLOW_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});

export const getMotionsSubmodelSubscriptionConfig = (
    id: Id,
    hasMeetingIdChangedObservable: () => Observable<boolean>
) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            `motion_category_ids`,
            `motion_state_ids`,
            `motion_submitter_ids`,
            `motion_change_recommendation_ids`,
            `motion_comment_ids`,
            `motion_comment_section_ids`,
            `motion_statute_paragraph_ids`,
            `tag_ids`,
            `personal_note_ids`
        ]
    },
    subscriptionName: MOTION_SUBMODELS_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});
