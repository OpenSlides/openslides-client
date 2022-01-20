import { Identifiable } from 'app/shared/models/base/identifiable';
import { Base64Encoded, Id } from '../definitions/key-types';
export namespace ResourceAction {
    export const UPLOAD = `resource.upload`;
    export const DELETE = `resource.delete`;

    export interface UploadPayload {
        token: string;
        file: Base64Encoded;
        filename: string;
        organization_id: Id;
    }

    export interface DeletePayload extends Identifiable {}
}
