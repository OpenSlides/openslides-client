import { Identifiable } from 'app/shared/models/base/identifiable';
import { DataClass } from '../decorators/data-class';
import { Id, UnsafeHtml } from '../definitions/key-types';

export class CommitteeAction {
    public static readonly CREATE = 'committee.create';
    public static readonly UPDATE = 'committee.update';
    public static readonly DELETE = 'committee.delete';
}

class CommitteePartialPayload {
    description?: UnsafeHtml = '';
    // For UPDATE: Required permission: OML.can_manage_organization
    user_ids?: Id[] = [];
    manager_ids?: Id[] = [];
    // For UPDATE: Required permission: CML.can_manage || OML.can_manage_organization
    organization_tag_ids?: Id[] = [];
    // Required permission: OML.can_manage_organization
    forward_to_committee_ids?: Id[] = [];
    receive_forwardings_from_committee_ids?: Id[] = [];
}

/**
 * Required permission: `OML.can_manage_organization`
 */
@DataClass(CommitteeAction.CREATE)
export class CommitteeCreatePayload extends CommitteePartialPayload {
    name: string = '';
    organization_id: Id = 0;
}

/**
 * Required permission: `CML.can_manage` || `OML.can_manage_organization`
 */
@DataClass(CommitteeAction.UPDATE)
export class CommitteeUpdatePayload extends CommitteePartialPayload implements Identifiable {
    id: Id = 0;
    name?: string = '';
    template_meeting_id?: number = 0;
    default_meeting_id?: number = 0;
}

@DataClass(CommitteeAction.DELETE)
export class CommitteeDeletePayload implements Identifiable {
    id: Id = 0;
}
