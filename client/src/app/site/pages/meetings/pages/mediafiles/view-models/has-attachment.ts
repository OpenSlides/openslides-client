import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { HasAttachmentMeetingMediafileIds } from '../../../../../../domain/interfaces/has-attachment-ids';
import { ViewMediafile } from './view-mediafile';

export type HasAttachmentMeetingMediafiles = HasAttachmentMeetingMediafileIds &
    ViewModelRelations<{
        attachment_meeting_mediafiles: ViewMediafile[];
    }>;
