import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace CommitteeAction {
    interface PartialPayload {
        description?: UnsafeHtml;
        member_ids?: Id[];
        manager_ids?: Id[];
    }

    export interface CreatePayload extends PartialPayload {
        name: string;
        organisation_id: Id;
    }
    export interface UpdatePayload extends Identifiable, PartialPayload {
        // Optional
        name?: string;
        template_meeting_id?: Id;
        default_meeting_id?: Id;
        forward_to_committee_ids?: Id[];
    }
}
