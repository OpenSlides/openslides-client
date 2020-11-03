import { Id } from 'app/core/definitions/key-types';
import { BasePollData } from 'app/site/polls/services/poll.service';
import { BaseDecimalModel } from '../base/base-decimal-model';
import { BaseOption } from './base-option';
import { HasMeetingId } from '../base/has-meeting-id';
import { HasProjectableIds } from '../base/has-projectable-ids';

export enum PollColor {
    yes = '#4caf50',
    no = '#cc6c5b',
    abstain = '#a6a6a6',
    votesvalid = '#e2e2e2',
    votesinvalid = '#e2e2e2',
    votescast = '#e2e2e2'
}

export enum PollState {
    Created = 'created',
    Started = 'started',
    Finished = 'finished',
    Published = 'published'
}

export enum PollType {
    Analog = 'analog',
    Named = 'named',
    Pseudoanonymous = 'pseudoanonymous'
}

export enum MajorityMethod {
    Simple = 'simple',
    TwoThirds = 'two_thirds',
    ThreeQuarters = 'three_quarters',
    Disabled = 'disabled'
}

export enum PercentBase {
    YN = 'YN',
    YNA = 'YNA',
    Valid = 'valid',
    Cast = 'cast',
    Disabled = 'disabled'
}

export const VOTE_MAJORITY = -1;
export const VOTE_UNDOCUMENTED = -2;
export const LOWEST_VOTE_VALUE = VOTE_UNDOCUMENTED;

export abstract class BasePoll<
    T = any,
    O extends BaseOption<any> = any,
    PM extends string = string,
    PB extends string = string
> extends BaseDecimalModel<T> {
    public id: Id;
    public state: PollState;
    public type: PollType;
    public title: string;
    public votesvalid: number;
    public votesinvalid: number;
    public votescast: number;
    public onehundred_percent_base: PB;
    public majority_method: MajorityMethod;
    public voted_id: number[];
    public user_has_voted: boolean;
    public user_has_voted_for_delegations: Id[];
    public pollmethod: PM;

    public voted_ids: Id[]; // (user/(assignment|motion)_poll_voted_$<meeting_id>_ids)[];
    public entitled_group_ids: Id[]; // (group/(assignment|motion)_poll_ids)[];
    public option_ids: Id[]; // ((assignment|motion)_option/poll_id)[];

    public get isCreated(): boolean {
        return this.state === PollState.Created;
    }

    public get isStarted(): boolean {
        return this.state === PollState.Started;
    }

    public get isFinished(): boolean {
        return this.state === PollState.Finished;
    }

    public get isPublished(): boolean {
        return this.state === PollState.Published;
    }

    public get isPercentBaseCast(): boolean {
        return this.onehundred_percent_base === PercentBase.Cast;
    }

    public get isAnalog(): boolean {
        return this.type === PollType.Analog;
    }

    public get isNamed(): boolean {
        return this.type === PollType.Named;
    }

    public get isAnonymous(): boolean {
        return this.type === PollType.Pseudoanonymous;
    }

    public get isEVoting(): boolean {
        return this.isNamed || this.isAnonymous;
    }

    /**
     * Determine if the state is finished or published
     */
    public get stateHasVotes(): boolean {
        return this.isFinished || this.isPublished;
    }

    public get nextState(): PollState {
        switch (this.state) {
            case PollState.Created:
                return PollState.Started;
            case PollState.Started:
                return PollState.Finished;
            case PollState.Finished:
                return PollState.Published;
            case PollState.Published:
                return PollState.Created;
        }
    }
}
export interface BasePoll<
    T = any,
    O extends BaseOption<any> = any,
    PM extends string = string,
    PB extends string = string
> extends HasMeetingId,
        HasProjectableIds,
        BasePollData<PM, PB> {}
