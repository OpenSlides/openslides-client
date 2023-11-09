import { BaseModel } from '../base/base-model';

/**
 *  Representation of a subdivision
 *  @ignore
 */
export class Subdivision extends BaseModel<Subdivision> {
    public static COLLECTION = `subdivision`;

    public name: string;
    public color: string;
    public allow_additional_time: boolean;

    public constructor(input?: Partial<Subdivision>) {
        super(Subdivision.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof Subdivision)[] = [`id`, `name`, `color`, `allow_additional_time`];
}
export interface Subdivision {}
