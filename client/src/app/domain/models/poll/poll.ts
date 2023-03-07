import { HasSequentialNumber } from 'src/app/domain/interfaces';

import { Fqid, Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { BaseDecimalModel } from '../base/base-decimal-model';
import {
    CalculablePollKey,
    EntitledUsersEntry,
    PollBackendDurationType,
    PollMethod,
    PollPercentBase,
    PollState,
    PollType
} from './poll-constants';

export class Poll extends BaseDecimalModel<Poll> {
    public static readonly COLLECTION = `poll`;
    public static readonly DECIMAL_FIELDS: (keyof Poll)[] = [`votesvalid`, `votesinvalid`, `votescast`];

    public content_object_id!: Fqid;
    public state!: PollState;
    public type!: PollType;
    public title!: string;
    public votesvalid!: number;
    public votesinvalid!: number;
    public votescast!: number;
    public vote_count!: number;
    public onehundred_percent_base!: PollPercentBase;

    /**
     * TODO:
     * Not sure how vote delegations are handled now
     */
    public user_has_voted_for_delegations!: Id[];

    public pollmethod!: PollMethod;

    public voted_ids!: Id[]; // (user/poll_voted_ids)[];

    public entitled_group_ids!: Id[]; // (group/(assignment|motion)_poll_ids)[];
    public option_ids!: Id[]; // ((assignment|motion)_option/poll_id)[];
    public global_option_id!: Id; // (motion_option/poll_id)
    public backend!: PollBackendDurationType;

    public description!: string;
    public min_votes_amount!: number;
    public max_votes_amount!: number;
    public max_votes_per_option!: number;
    public global_yes!: boolean;
    public global_no!: boolean;
    public global_abstain!: boolean;
    public entitled_users_at_stop!: EntitledUsersEntry[];

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
        return this.onehundred_percent_base === PollPercentBase.Cast;
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

    public constructor(input?: any) {
        super(Poll.COLLECTION, input);
    }

    public get isMethodY(): boolean {
        return this.pollmethod === PollMethod.Y;
    }

    public get isMethodN(): boolean {
        return this.pollmethod === PollMethod.N;
    }

    public get isMethodYN(): boolean {
        return this.pollmethod === PollMethod.YN;
    }

    public get isMethodYNA(): boolean {
        return this.pollmethod === PollMethod.YNA;
    }

    public get hasGlobalOptionEnabled(): boolean {
        return this.global_yes || this.global_no || this.global_abstain;
    }

    public get pollmethodFields(): CalculablePollKey[] {
        if (this.pollmethod === PollMethod.YN) {
            return [`yes`, `no`];
        } else if (this.pollmethod === PollMethod.YNA) {
            return [`yes`, `no`, `abstain`];
        } else if (this.pollmethod === PollMethod.Y) {
            return [`yes`];
        }
        return [];
    }

    protected getDecimalFields(): (keyof Poll)[] {
        return Poll.DECIMAL_FIELDS;
    }
}

export interface Poll extends HasMeetingId, HasProjectionIds, HasSequentialNumber {}
