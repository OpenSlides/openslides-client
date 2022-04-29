import { HasAttachmentIds } from '../../../../../../domain/interfaces/has-attachment-ids';
import { ViewMediafile } from './view-mediafile';

export interface HasAttachment extends HasAttachmentIds {
    attachments: ViewMediafile[];
}
