import { Id } from '@app/domain/definitions/key-types';
import { PollEntitledUser } from '@app/domain/models/poll/poll-entitled-user';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { Observable, switchMap } from 'rxjs';

import { BaseViewModel, ViewModelRelations } from '../../../../../base/base-view-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewMeetingUser } from '../../../view-models/view-meeting-user';
import { ViewUser } from '../../../view-models/view-user';

export class ViewPollEntitledUser extends BaseViewModel<PollEntitledUser> {
    public static COLLECTION = PollEntitledUser.COLLECTION;
    protected _collection = PollEntitledUser.COLLECTION;

    public get entitledUser(): PollEntitledUser {
        return this._model;
    }

    public get user(): ViewUser {
        return this.meeting_user?.user;
    }

    public get user$(): Observable<ViewUser> {
        return this.meeting_user$.pipe(switchMap(m => m.user$));
    }

    public get structureLevelIds(): Id[] {
        return this.user?.structure_level_ids() || [];
    }

    public get groupIds(): Id[] {
        return this.user?.group_ids() || [];
    }
}

interface IViewPollEntitledUserRelations {
    poll: ViewPoll;
    meeting_user?: ViewMeetingUser;
}

export interface ViewPollEntitledUser
    extends HasMeeting, ViewModelRelations<IViewPollEntitledUserRelations>, PollEntitledUser {}
