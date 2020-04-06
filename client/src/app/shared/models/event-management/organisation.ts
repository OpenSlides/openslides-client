import { BaseModel } from '../base/base-model';

export class Organisation extends BaseModel<Organisation> {
    public static COLLECTION = 'organisation';

    public id: number;
    public name: string;
    public description: string;

    // Configs
    public legal_notice: string;
    public privacy_policy: string;
    public login_text: string;
    public theme: string;
    public custom_translations: JSON;

    public committee_ids: number[]; // (committee/organisation_id)[];
    public role_ids: number[]; // (role/organisation_id)[];
    public resource_ids: number[]; // (resource/organisation_id)[];

    public constructor(input?: any) {
        super(Organisation.COLLECTION, input);
    }
}
