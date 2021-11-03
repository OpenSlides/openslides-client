import { HasMeeting } from 'app/management/models/view-meeting';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewUser } from 'app/site/users/models/view-user';

import { ViewOption } from './view-option';
import { Vote } from './vote';

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
