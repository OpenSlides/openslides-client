import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';

export namespace TagAction {
    export const CREATE = 'tag.create';
    export const UPDATE = 'tag.update';
    export const DELETE = 'tag.delete';

    export interface CreatePayload extends HasMeetingId {
        name: string;
    }
    export interface UpdatePayload extends Identifiable {
        name?: string;
    }
}
