import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { HasAttachmentIds } from '../../../../../../domain/interfaces/has-attachment-ids';
import { ViewMediafile } from './view-mediafile';

export type HasAttachment = HasAttachmentIds &
    ViewModelRelations<{
        attachments: ViewMediafile[];
    }>;
