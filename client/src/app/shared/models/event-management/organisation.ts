import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

export interface OrganisationSetting {
    name: string;
    description: string;
    legal_notice: string;
    privacy_policy: string;
    login_text: string;
    theme: string;
    custom_translations: JSON[];
    reset_password_verbose_errors: boolean;
    enable_electronic_voting: boolean;
}

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
    public custom_translations: JSON[];
    public reset_password_verbose_errors: boolean;
    public enable_electronic_voting: boolean;

    public committee_ids: Id[]; // (committee/organisation_id)[];
    public resource_ids: Id[]; // (resource/organisation_id)[];
    public organisation_tag_ids: Id[]; // (organisation_tag/organisation_id)[]

    public constructor(input?: any) {
        super(Organisation.COLLECTION, input);
    }
}

export interface Organisation extends OrganisationSetting {}
