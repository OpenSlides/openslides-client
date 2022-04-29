import { Id } from '../../definitions/key-types';
import { BaseModel } from '../base/base-model';

export class Resource extends BaseModel<Resource> {
    public static COLLECTION = `resource`;

    public token!: string;
    public filesize!: number;
    public mimetype!: string;

    public organization_id!: Id; // organization/resource_ids;

    public constructor(input?: any) {
        super(Resource.COLLECTION, input);
    }
}
