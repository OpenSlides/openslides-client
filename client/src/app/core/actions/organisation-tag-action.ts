import { Identifiable } from 'app/shared/models/base/identifiable';
import { HtmlColor, Id } from '../definitions/key-types';

export namespace OrganisationTagAction {
    export const CREATE = 'organisation_tag.create';
    export const UPDATE = 'organisation_tag.update';
    export const DELETE = 'organisation_tag.delete';

    export interface OrganisationTagPayload {
        name: string;
        color: HtmlColor;
    }

    export interface CreatePayload extends OrganisationTagPayload {
        organisation_id: Id;
    }

    export interface UpdatePayload extends Identifiable, Partial<OrganisationTagPayload> {}

    export interface DeletePayload extends Identifiable {}
}
