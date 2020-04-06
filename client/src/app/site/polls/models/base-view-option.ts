import { BaseOption } from 'app/shared/models/poll/base-option';
import { BaseViewModel } from '../../base/base-view-model';
import { BaseViewPoll } from './base-view-poll';
import { BaseViewVote } from './base-view-vote';

export class BaseViewOption<
    M extends BaseOption<M> = any,
    P extends BaseViewPoll = any,
    V extends BaseViewVote = any
> extends BaseViewModel<M> {
    public get option(): M {
        return this._model;
    }
}
interface IBaseOptionRelations<P extends BaseViewPoll = any, V extends BaseViewVote = any> {
    votes: V[];
    poll: P;
}
export interface BaseViewOption<
    M extends BaseOption<M> = any,
    P extends BaseViewPoll = any,
    V extends BaseViewVote = any
> extends BaseOption<M>, IBaseOptionRelations<P, V> {}
