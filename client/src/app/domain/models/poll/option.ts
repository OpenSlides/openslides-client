import { Fqid, Id, Ids } from '../../definitions/key-types';
import { BaseDecimalModel } from '../base/base-decimal-model';

export class Option extends BaseDecimalModel<Option> {
    public static COLLECTION = `option`;
    public static readonly DECIMAL_FIELDS: (keyof Option)[] = [`yes`, `no`, `abstain`];

    public text!: string;
    public yes!: number;
    public no!: number;
    public abstain!: number;

    public poll_id!: Id; // (assignment|motion)_poll/option_ids;
    public vote_ids!: Ids; // ((assignment|motion)_vote/option_id)[];

    public weight!: number;
    public content_object_id!: Fqid;

    public constructor(input?: any) {
        super(Option.COLLECTION, input);
    }

    protected getDecimalFields(): (keyof Option)[] {
        return Option.DECIMAL_FIELDS;
    }
}
