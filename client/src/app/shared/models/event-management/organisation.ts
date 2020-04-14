import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

export class Organisation extends BaseModel<Organisation> {
    public static COLLECTION = 'organisation';

    public id: Id;
    public name: string;
    public description: string;

    // Configs
    public legal_notice: string;
    public privacy_policy: string;
    public login_text: string;
    public theme: string;
    public custom_translations: JSON;
    public reset_password_verbose_errors: boolean;
    public enable_electronic_voting: boolean;

    public committee_ids: Id[]; // (committee/organisation_id)[];
    public role_ids: Id[]; // (role/organisation_id)[];
    public resource_ids: Id[]; // (resource/organisation_id)[];

    public constructor(input?: any) {
        super(Organisation.COLLECTION, input);
    }
}
