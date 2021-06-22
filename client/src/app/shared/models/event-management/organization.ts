import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

export interface OrganizationSetting {
    name: string;
    description: string;
    legal_notice: string;
    privacy_policy: string;
    login_text: string;
    theme: string;
    reset_password_verbose_errors: boolean;
    enable_electronic_voting: boolean;
}

export class Organization extends BaseModel<Organization> {
    public static COLLECTION = 'organization';

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

    public committee_ids: Id[]; // (committee/organization_id)[];
    public resource_ids: Id[]; // (resource/organization_id)[];
    public organization_tag_ids: Id[]; // (organization_tag/organization_id)[]

    public constructor(input?: any) {
        super(Organization.COLLECTION, input);
    }
}

export interface Organization extends OrganizationSetting {}
