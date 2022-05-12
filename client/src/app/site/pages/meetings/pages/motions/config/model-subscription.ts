import { Id } from 'src/app/domain/definitions/key-types';
import { Observable, map } from 'rxjs';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

const MOTION_LIST_SUBSCRIPTION = `motion_list`;
const MOTION_BLOCK_SUBSCRIPTION = `motion_block`;
const MOTION_WORKFLOW_SUBSCRiPTION = `motion_workflow`;
const MOTION_SUBMODELS_SUBSCRIPTION = `motion_submodels`;

export const getMotionListSubscriptionConfig = (id: Id, getNextMeetingIdObservable: () => Observable<Id | null>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`motion_ids`]
    },
    subscriptionName: MOTION_LIST_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});

export const getMotionBlockSubscriptionConfig = (id: Id, getNextMeetingIdObservable: () => Observable<Id | null>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`motion_block_ids`]
    },
    subscriptionName: MOTION_BLOCK_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});

export const getMotionWorkflowSubscriptionConfig = (
    id: Id,
    getNextMeetingIdObservable: () => Observable<Id | null>
) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`motion_workflow_ids`]
    },
    subscriptionName: MOTION_WORKFLOW_SUBSCRiPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});

export const getMotionsSubmodelSubscriptionConfig = (
    id: Id,
    getNextMeetingIdObservable: () => Observable<Id | null>
) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [
            `motion_category_ids`,
            `motion_workflow_ids`,
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
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});
