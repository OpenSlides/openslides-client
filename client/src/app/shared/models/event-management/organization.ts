import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

export interface OrganizationSetting {
    name: string;
    description: string;
    legal_notice: string;
    privacy_policy: string;
    login_text: string;
    theme_id: Id; // (theme/theme_for_organization_id);
    theme_ids: Id[]; // (theme/organization_id);
    reset_password_verbose_errors: boolean;
    enable_electronic_voting: boolean;
    limit_of_meetings: number;
    limit_of_users: number;
}

export class Organization extends BaseModel<Organization> {
    public static COLLECTION = 'organization';

    public id: Id;
    public name: string;
    public description: string;

    public committee_ids: Id[]; // (committee/organization_id)[];
    public resource_ids: Id[]; // (resource/organization_id)[];
    public organization_tag_ids: Id[]; // (organization_tag/organization_id)[];
    public active_meeting_ids: Id[]; // (meeting/is_active_in_organization_id);

    public constructor(input?: any) {
        super(Organization.COLLECTION, input);
    }
}

export interface Organization extends OrganizationSetting {}
