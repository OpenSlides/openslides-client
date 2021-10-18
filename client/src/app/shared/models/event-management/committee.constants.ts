import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Id } from '../../../core/definitions/key-types';

export interface CommitteeCsvPort {
    id: Id;
    name: string;
    description?: string;
    forward_to_committee_ids?: string;
    organization_tag_ids?: string;
    manager_ids?: string | number[];
    meeting?: string | number;
    meeting_start_date?: string | number;
    meeting_end_date?: string | number;
}

export const COMMITTEE_PORT_HEADERS_AND_VERBOSE_NAMES: Partial<CommitteeCsvPort> = {
    name: _('Title'),
    description: _('Description'),
    forward_to_committee_ids: _('Can forward motions to committee'),
    organization_tag_ids: _('Tags'),
    manager_ids: _('Administrators'),
    meeting: _('Meeting'),
    meeting_start_date: _("Meeting's start date"),
    meeting_end_date: _("Meeting's end date")
};
