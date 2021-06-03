import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace CommitteeAction {
    export const CREATE = 'committee.create';
    export const UPDATE = 'committee.update';
    export const DELETE = 'committee.delete';

    interface PartialPayload {
        description?: UnsafeHtml;
        // For UPDATE: Required permission: OML.can_manage_organization
        user_ids?: Id[];
        // For UPDATE: Required permission: CML.can_manage || OML.can_manage_organization
        organization_tag_ids?: Id[];
    }

    /**
     * Required permission: `OML.can_manage_organization`
     */
    export interface CreatePayload extends PartialPayload {
        name: string;
        organization_id: Id;
    }

    /**
     * Required permission: `CML.can_manage` || `OML.can_manage_organization`
     */
    export interface UpdatePayload extends Identifiable, PartialPayload {
        // Optional
        // Required permission: CML.can_manage
        name?: string;
        template_meeting_id?: Id;
        default_meeting_id?: Id;
        // Required permission: OML.can_manage_organization
        forward_to_committee_ids?: Id[];
        receive_forwardings_from_committee_ids?: Id[];
    }

    export interface DeletePayload extends Identifiable {}
}
