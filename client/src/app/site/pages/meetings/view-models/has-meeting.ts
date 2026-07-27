import { ViewModelRelations } from '@app/site/base/base-view-model';

import { ViewMeeting } from './view-meeting';

export type HasMeeting = ViewModelRelations<{
    meeting: ViewMeeting;
}>;
