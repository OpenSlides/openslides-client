import { HasSequentialNumber } from 'src/app/domain/interfaces';

import { Fqid, Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { BaseModel } from '../base/base-model';
import { PollState, PollVisibility } from './poll-constants';

export class Poll extends BaseModel<Poll> {
    public static readonly COLLECTION = `poll`;

    public sequential_number!: number;
    public title!: string;
    public content_object_id!: Fqid;

    public config_id!: Fqid;
    public visibility!: PollVisibility;
    public state!: PollState;
    public result!: string;
    public published!: boolean;
    public allow_invalid!: boolean;
    public allow_vote_split!: boolean;
    public option_ids!: Id[];
    public ballot_ids!: Id[];
    public voted_ids!: Id[];
    public entitled_group_ids!: Id[];

    // TODO: Currently missing in backend
    public live_voting_enabled!: boolean;

    public get isCreated(): boolean {
        return this.state === PollState.Created;
    }

    public get isStarted(): boolean {
        return this.state === PollState.Started;
    }

    public get isFinished(): boolean {
        return this.state === PollState.Finished;
    }

    public get isAnonymized(): boolean {
        // TODO: Implement if field is available to decide this
        return !this.isNamed && !this.isAnalog && false;
    }

    public get canAnonymize(): boolean {
        return !this.isAnonymized && !this.isAnalog && !this.isNamed && (this.isFinished || this.isPublished);
    }

    public get isPublished(): boolean {
        return this.state === PollState.Finished && this.published;
    }

    public get isAnalog(): boolean {
        return this.visibility === PollVisibility.Manually;
    }

    public get isNamed(): boolean {
        return this.visibility === PollVisibility.Named;
    }

    public get isOpen(): boolean {
        return this.visibility === PollVisibility.Open;
    }

    public get isAnonymous(): boolean {
        return this.visibility === PollVisibility.Secret;
    }

    public get isEVoting(): boolean {
        return this.isNamed || this.isOpen || this.isAnonymous;
    }

    /**
     * Determine if the state is finished or published
     */
    public get stateHasVotes(): boolean {
        return this.isFinished || this.isPublished;
    }

    public get nextState(): PollState | `published` {
        switch (this.state) {
            case PollState.Created:
                return PollState.Started;
            case PollState.Started:
                return PollState.Finished;
            case PollState.Finished:
                return `published`;
        }
    }

    public constructor(input?: any) {
        super(Poll.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof Poll)[] = [
        `id`,
        `title`,
        `config_id`,
        `option_ids`,
        `visibility`,
        `state`,
        `result`,
        `published`,
        `allow_invalid`,
        `allow_vote_split`,
        `sequential_number`,
        `content_object_id`,
        `ballot_ids`,
        `voted_ids`,
        `entitled_group_ids`,
        `projection_ids`,
        `meeting_id`
    ];
}

export interface Poll extends HasMeetingId, HasProjectionIds, HasSequentialNumber {}
