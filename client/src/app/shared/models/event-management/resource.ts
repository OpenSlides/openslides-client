import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

export class Resource extends BaseModel<Resource> {
    public static COLLECTION = 'resource';

    public id: Id;
    public token: string;
    public filesize: number;
    public mimetype: string;

    public organisation_id: Id; // organisation/resource_ids;

    public constructor(input?: any) {
        super(Resource.COLLECTION, input);
    }
}
