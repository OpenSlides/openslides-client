import { Id } from 'src/app/domain/definitions/key-types';

import { Vote } from '../../../../../../domain/models/poll/vote';
import { BaseViewModel, ViewModelRelations } from '../../../../../base/base-view-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewMeetingUser } from '../../../view-models/view-meeting-user';
import { ViewUser } from '../../../view-models/view-user';
import { ViewOption } from './view-option';

export class ViewVote extends BaseViewModel<Vote> {
    public static COLLECTION = Vote.COLLECTION;
    protected _collection = Vote.COLLECTION;

    public get vote(): Vote {
        return this._model;
    }

    public get structureLevelIds(): Id[] {
        return this.user.structure_level_ids();
    }

    public get groupIds(): Id[] {
        return this.user.group_ids();
    }
}

interface IViewVoteRelations {
    user?: ViewUser;
    delegated_user?: ViewMeetingUser;
    option: ViewOption;
}

export interface ViewVote extends HasMeeting, ViewModelRelations<IViewVoteRelations>, Vote {}
