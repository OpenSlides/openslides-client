import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

const ASSIGNMENT_LIST_SUBSCRIPTION = `assignment_list`;

export const getAssignmentSubscriptionConfig = (id: Id, hasMeetingIdChangedObservable: () => Observable<boolean>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`assignment_ids`, `assignment_candidate_ids`]
    },
    subscriptionName: ASSIGNMENT_LIST_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});
