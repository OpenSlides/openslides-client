import { Id } from 'src/app/domain/definitions/key-types';

import { PollBallot } from '../../../../../../domain/models/poll/poll-ballot';
import { BaseViewModel, ViewModelRelations } from '../../../../../base/base-view-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewMeetingUser } from '../../../view-models/view-meeting-user';
import { ViewUser } from '../../../view-models/view-user';
import { ViewPoll } from '..';

export class ViewPollBallot extends BaseViewModel<PollBallot> {
    public static COLLECTION = PollBallot.COLLECTION;
    protected _collection = PollBallot.COLLECTION;

    public get ballot(): PollBallot {
        return this._model;
    }

    public get structureLevelIds(): Id[] {
        return this.user.structure_level_ids();
    }

    public get groupIds(): Id[] {
        return this.user.group_ids();
    }
}

interface IViewPollBallotRelations {
    poll: ViewPoll;
    user?: ViewUser;
    delegated_user?: ViewMeetingUser;
}

export interface ViewPollBallot extends HasMeeting, ViewModelRelations<IViewPollBallotRelations>, PollBallot {}
