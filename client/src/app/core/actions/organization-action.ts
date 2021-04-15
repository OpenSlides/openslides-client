import { Identifiable } from 'app/shared/models/base/identifiable';
import { OrganisationSetting } from 'app/shared/models/event-management/organisation';
import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace OrganizationAction {
    export const UPDATE = 'organisation.update';

    export interface UpdatePayload extends Identifiable, OrganisationSetting {}
}
