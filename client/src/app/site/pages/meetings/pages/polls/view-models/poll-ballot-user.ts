import { Id } from '@app/domain/definitions/key-types';
import { PollBallotUser } from '@app/domain/models/poll/poll-ballot-user';
import { Observable, switchMap } from 'rxjs';

import { BaseViewModel, ViewModelRelations } from '../../../../../base/base-view-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewMeetingUser } from '../../../view-models/view-meeting-user';
import { ViewUser } from '../../../view-models/view-user';
import { ViewPoll, ViewPollBallot } from '..';

export class ViewPollBallotUser extends BaseViewModel<PollBallotUser> {
    public static COLLECTION = PollBallotUser.COLLECTION;
    protected _collection = PollBallotUser.COLLECTION;

    public get ballotUser(): PollBallotUser {
        return this._model;
    }

    public get user(): ViewUser {
        return this.represented_meeting_user.user;
    }

    public get user$(): Observable<ViewUser> {
        return this.represented_meeting_user$.pipe(switchMap(m => m.user$));
    }

    public get structureLevelIds(): Id[] {
        return this.user?.structure_level_ids() || [];
    }

    public get groupIds(): Id[] {
        return this.user?.group_ids() || [];
    }
}

interface IViewPollBallotUserRelations {
    poll: ViewPoll;
    poll_ballot: ViewPollBallot;
    acting_meeting_user?: ViewMeetingUser;
    represented_meeting_user?: ViewMeetingUser;
}

export interface ViewPollBallotUser
    extends HasMeeting, ViewModelRelations<IViewPollBallotUserRelations>, PollBallotUser {}
