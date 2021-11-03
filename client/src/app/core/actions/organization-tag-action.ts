import { Identifiable } from 'app/shared/models/base/identifiable';

import { HtmlColor, Id } from '../definitions/key-types';

export namespace OrganizationTagAction {
    export const CREATE = `organization_tag.create`;
    export const UPDATE = `organization_tag.update`;
    export const DELETE = `organization_tag.delete`;

    export interface OrganizationTagPayload {
        name: string;
        color?: HtmlColor;
    }

    export interface CreatePayload extends OrganizationTagPayload {
        organization_id: Id;
    }

    export interface UpdatePayload extends Identifiable, Partial<OrganizationTagPayload> {}

    export interface DeletePayload extends Identifiable {}
}
