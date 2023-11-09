import { BaseModel } from '../base/base-model';

/**
 *  Representation of a subdivision
 *  @ignore
 */
export class Subdivision extends BaseModel<Subdivision> {
    public static COLLECTION = `subdivision`;

    public readonly title!: string;

    public constructor(input?: Partial<Subdivision>) {
        super(Subdivision.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof Subdivision)[] = [`id`, `title`];
}
export interface Subdivision {}
