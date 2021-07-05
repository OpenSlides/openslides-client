import { Identifiable } from 'app/shared/models/base/identifiable';

export namespace ProjectionAction {
    export const DELETE = 'projection.delete';
    export const UPDATE_OPTIONS = 'projection.update_options';

    export interface UpdateOptionsPayload extends Identifiable {
        options: any;
    }
}
