import { CommitteeCsvPort } from '../../shared/models/event-management/committee.constants';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export const COMMITTEE_CSV_EXPORT_EXAMPLE: Partial<CommitteeCsvPort>[] = [
    {
        name: 'Committee A',
        forward_to_committee_ids: 'Committee B',
        organization_tag_ids: 'tag1',
        meeting: 1
    },
    {
        name: 'Committee B',
        description: 'text B',
        forward_to_committee_ids: 'Committee C',
        organization_tag_ids: 'tag2',
        manager_ids: 'Max Mustermann',
        meeting: 'Meeting B1',
        meeting_start_date: '2021-12-17',
        meeting_end_date: '2021-12-19'
    },
    {
        name: 'Committee C',
        description: 'text C',
        forward_to_committee_ids: 'Committee C',
        organization_tag_ids: 'tag3'
    }
];
