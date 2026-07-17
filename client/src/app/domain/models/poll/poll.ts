import { HasSequentialNumber } from '@app/domain/interfaces';

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
    public anonymized!: boolean;
    public published!: boolean;
    public allow_invalid!: boolean;
    public allow_vote_split!: boolean;
    public option_ids!: Id[];
    public ballot_ids!: Id[];
    public voted_ids!: Id[];
    public entitled_group_ids!: Id[];
    public live_voting_enabled!: boolean;

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
        `anonymized`,
        `allow_invalid`,
        `allow_vote_split`,
        `live_voting_enabled`,
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
