import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';

const ASSIGNMENT_LIST_SUBSCRIPTION = `assignment_list`;

export const getAssignmentSubscriptionConfig = (id: Id, getNextMeetingIdObservable: () => Observable<Id | null>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`assignment_ids`, `assignment_candidate_ids`]
    },
    subscriptionName: ASSIGNMENT_LIST_SUBSCRIPTION,
    hideWhen: getNextMeetingIdObservable().pipe(map(id => !id))
});
