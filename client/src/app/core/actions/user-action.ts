import { Identifiable } from 'app/shared/models/base/identifiable';

export namespace UserAction {
    export interface CreatePayload {}
    export interface UpdatePayload {}
    export interface ResetPasswordPayload extends Identifiable {}
    export interface SetNewPasswordPayload extends Identifiable {}
}
