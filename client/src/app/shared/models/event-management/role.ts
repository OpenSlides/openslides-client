import { BaseModel } from '../base/base-model';

export class Role extends BaseModel<Role> {
    public static COLLECTION = 'role';

    public id: number;
    public name: string;
    public permissions: string[];
    public is_superadmin_role: boolean;

    public organisation_id: number; // organisation/role_ids;
    public user_ids: number[]; // (user/role_id)[];

    public constructor(input?: any) {
        super(Role.COLLECTION, input);
    }
}
