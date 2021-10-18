import { CommitteeCsvPort } from '../../shared/models/event-management/committee.constants';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export const COMMITTEE_CSV_EXPORT_EXAMPLE: Partial<CommitteeCsvPort>[] = [
    {
        name: _('Audit committee'),
        forward_to_committee_ids: _('Election committee'),
        organization_tag_ids: _('Audit'),
        meeting: 1
    },
    {
        name: _('Election committee'),
        description: _('This committee has to overwatch and perform elections'),
        forward_to_committee_ids: _('Finance committee'),
        organization_tag_ids: _('Election'),
        manager_ids: _('Michael Mann'),
        meeting: _('The election'),
        meeting_start_date: _('December 17, 2021'),
        meeting_end_date: _('December 22, 2021')
    },
    {
        name: _('Finance committee'),
        description: _('A committee to observe financial activities'),
        organization_tag_ids: _('Financial')
    }
];
