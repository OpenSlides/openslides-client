import { HasMeetingId } from 'app/core/actions/common/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace MediafileAction {
    interface HaveParent {
        parent_id?: Id;
    }
    interface MediafileAttributes {
        title: string;
        access_group_ids?: Id[];
    }
    interface MediafilePlace {
        place: string;
    }

    export interface CreateFilePayload extends HasMeetingId, MediafileAttributes, HaveParent {
        file: string; // base64 encoded
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
    export interface SetAsLogoPayload extends Identifiable, MediafilePlace {}
    export interface SetAsFontPayload extends Identifiable, MediafilePlace {}
}
