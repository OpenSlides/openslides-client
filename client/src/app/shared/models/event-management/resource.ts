import { BaseModel } from '../base/base-model';

export class Resource extends BaseModel<Resource> {
    public static COLLECTION = 'resource';

    public id: number;
    public token: string;
    public filesize: number;
    public mimetype: string;

    public organisation_id: number; // organisation/resource_ids;

    public constructor(input?: any) {
        super(Resource.COLLECTION, input);
    }
}
