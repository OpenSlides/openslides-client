import { Vote } from '../../../../../../domain/models/poll/vote';
import { BaseViewModel } from '../../../../../base/base-view-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewMeetingUser } from '../../../view-models/view-meeting-user';
import { ViewUser } from '../../../view-models/view-user';
import { ViewOption } from './view-option';
export class ViewVote extends BaseViewModel<Vote> {
    public static COLLECTION = Vote.COLLECTION;
    protected _collection = Vote.COLLECTION;

    public get vote(): Vote {
        this.delegated_user_id;
        return this._model;
    }
}

interface IViewVoteRelations {
    user?: ViewUser;
    delegated_user?: ViewMeetingUser;
    option: ViewOption;
}

export interface ViewVote extends HasMeeting, IViewVoteRelations, Vote {}
