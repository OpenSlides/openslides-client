import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';

import { ViewMeeting } from '../../view-models/view-meeting';

export const MEDIAFILES_SUBSCRIPTION = `mediafiles`;

export const getMediafilesSubscriptionConfig = (id: Id, hasMeetingIdChangedObservable: () => Observable<boolean>) => ({
    modelRequest: {
        viewModelCtor: ViewMeeting,
        ids: [id],
        follow: [`mediafile_ids`]
    },
    subscriptionName: MEDIAFILES_SUBSCRIPTION,
    hideWhen: hasMeetingIdChangedObservable()
});
