import { Id } from 'app/core/definitions/key-types';

export interface HasAttachmentIds {
    attachment_ids: Id[]; // (mediafile/attachment_ids)[];
}
