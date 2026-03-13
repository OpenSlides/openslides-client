import { Id } from 'src/app/domain/definitions/key-types';

import { Ballot } from '../../../../../../domain/models/poll/ballot';
import { BaseViewModel, ViewModelRelations } from '../../../../../base/base-view-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewMeetingUser } from '../../../view-models/view-meeting-user';
import { ViewUser } from '../../../view-models/view-user';
import { ViewOption } from './view-option';

export class ViewBallot extends BaseViewModel<Ballot> {
    public static COLLECTION = Ballot.COLLECTION;
    protected _collection = Ballot.COLLECTION;

    public get ballot(): Ballot {
        return this._model;
    }

    public get structureLevelIds(): Id[] {
        return this.user.structure_level_ids();
    }

    public get groupIds(): Id[] {
        return this.user.group_ids();
    }
}

interface IViewBallotRelations {
    user?: ViewUser;
    delegated_user?: ViewMeetingUser;
    option: ViewOption;
}

export interface ViewBallot extends HasMeeting, ViewModelRelations<IViewBallotRelations>, Ballot {}
