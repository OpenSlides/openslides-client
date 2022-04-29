import { Vote } from '../../../../../../domain/models/poll/vote';
import { BaseViewModel } from '../../../../../base/base-view-model';
import { ViewUser } from '../../../view-models/view-user';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewOption } from './view-option';
export class ViewVote extends BaseViewModel<Vote> {
    public static COLLECTION = Vote.COLLECTION;
    protected _collection = Vote.COLLECTION;

    public get vote(): Vote {
        return this._model;
    }
}

interface IViewVoteRelations {
    user?: ViewUser;
    delegated_user?: ViewUser;
    option: ViewOption;
}

export interface ViewVote extends HasMeeting, IViewVoteRelations, Vote {}
