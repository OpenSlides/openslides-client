import { Identifiable } from 'app/shared/models/base/identifiable';
import { OrganizationSetting } from 'app/shared/models/event-management/organization';

export namespace OrganizationAction {
    export const UPDATE = `organization.update`;

    export interface UpdatePayload extends Identifiable, Partial<OrganizationSetting> {}
}
