import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Base64Encoded, Id } from '../definitions/key-types';

export namespace MediafileAction {
    export const CREATE_FILE = 'mediafile.upload';
    export const CREATE_DIRECTORY = 'mediafile.create_directory';
    export const UPDATE = 'mediafile.update';
    export const MOVE = 'mediafile.move';
    export const DELETE = 'mediafile.delete';

    interface HaveParent {
        parent_id?: Id;
    }
    interface MediafileAttributes {
        title: string;
        access_group_ids?: Id[];
    }

    export interface CreateFilePayload extends HasMeetingId, MediafileAttributes, HaveParent {
        file: Base64Encoded; // base64 encoded
        filename: string;
    }
    export interface CreateDirectoryPayload extends HasMeetingId, MediafileAttributes, HaveParent {}
    export interface UpdatePayload extends Identifiable {
        title?: string;
        access_group_ids?: Id[];
    }
    export interface MovePayload extends HasMeetingId, HaveParent {
        ids: Id[];
    }
}
