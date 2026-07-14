import { Id } from '@app/domain/definitions/key-types';
import { Observable, switchMap } from 'rxjs';

import { PollBallot } from '../../../../../../domain/models/poll/poll-ballot';
import { BaseViewModel, ViewModelRelations } from '../../../../../base/base-view-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewMeetingUser } from '../../../view-models/view-meeting-user';
import { ViewUser } from '../../../view-models/view-user';
import { ViewPoll } from '..';

export type PollApprovalBallotValue = 'yes' | 'no' | 'abstain';
export type PollSelectionBallotValue = 'nota' | number[];
export type PollRatingApprovalBallotValue = Record<Id, 'yes' | 'no' | 'abstain'>;
export type PollRatingScoreBallotValue = Record<Id, number>;

export class ViewPollBallot<V = unknown> extends BaseViewModel<PollBallot> {
    public static COLLECTION = PollBallot.COLLECTION;
    protected _collection = PollBallot.COLLECTION;

    public get ballot(): PollBallot {
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

    private _parsedValue: V = null;
    public parsedValue(): V | null {
        if (!this._parsedValue && this.value) {
            this._parsedValue = JSON.parse(this.value);
        }

        return this._parsedValue;
    }
}

interface IViewPollBallotRelations {
    poll: ViewPoll;
    acting_meeting_user?: ViewMeetingUser;
    represented_meeting_user?: ViewMeetingUser;
}

export interface ViewPollBallot extends HasMeeting, ViewModelRelations<IViewPollBallotRelations>, PollBallot {}
