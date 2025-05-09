import { Id } from '../../definitions/key-types';
import { BaseModel } from '../base/base-model';
/**
 * Representation of a gender.
 * @ignore
 */

export class Gender extends BaseModel<Gender> {
    public static COLLECTION = `gender`;

    public readonly name!: string;
    public organization_id!: Id; // (organization/gender_ids)[]
    public user_ids!: Id[]; // user/gender_id

    public constructor(input?: Partial<Gender>) {
        super(Gender.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof Gender)[] = [`id`, `name`, `organization_id`, `user_ids`];
}
export interface Gender {
    readonly name: string;
    organization_id: Id; // (organization/gender_ids)[]
    user_ids: Id[]; // user/gender_id
}
