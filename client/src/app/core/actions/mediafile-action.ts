import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { HasOwnerId } from 'app/shared/models/base/has-owner-id';
import { Identifiable } from 'app/shared/models/base/identifiable';

import { Base64Encoded, Id } from '../definitions/key-types';

export namespace MediafileAction {
    export const CREATE_FILE = `mediafile.upload`;
    export const CREATE_DIRECTORY = `mediafile.create_directory`;
    export const UPDATE = `mediafile.update`;
    export const MOVE = `mediafile.move`;
    export const DELETE = `mediafile.delete`;

    interface HaveParent {
        parent_id?: Id;
    }
    interface MediafileAttributes {
        title: string;
        access_group_ids?: Id[];
    }

    export interface CreateFilePayload extends HasOwnerId, MediafileAttributes, HaveParent {
        file: Base64Encoded; // base64 encoded
        filename: string;
    }
    export interface CreateDirectoryPayload extends HasOwnerId, MediafileAttributes, HaveParent {}
    export interface UpdatePayload extends Identifiable {
        title?: string;
        access_group_ids?: Id[];
    }
    export interface DeletePayload extends Identifiable {}

    export interface MovePayload extends HasOwnerId, HaveParent {
        ids: Id[];
    }
}
