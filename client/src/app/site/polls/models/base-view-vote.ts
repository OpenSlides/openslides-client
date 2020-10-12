import { BaseVote } from 'app/shared/models/poll/base-vote';
import { HasMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewUser } from 'app/site/users/models/view-user';
import { BaseViewModel } from '../../base/base-view-model';
import { BaseViewOption } from './base-view-option';

export class BaseViewVote<M extends BaseVote<M> = any, O extends BaseViewOption = any> extends BaseViewModel<M> {
    public get vote(): M {
        return this._model;
    }
}
interface IBaseVoteRelations<O extends BaseViewOption> {
    user?: ViewUser;
    delegated_user?: ViewUser;
    option: O;
}
export interface BaseViewVote<M extends BaseVote<M> = any, O extends BaseViewOption = any>
    extends BaseVote<M>,
        IBaseVoteRelations<O>,
        HasMeeting {}
