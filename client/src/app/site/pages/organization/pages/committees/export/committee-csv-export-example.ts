import { CommitteeCsvPort } from 'src/app/domain/models/comittees/committee.constants';

export const COMMITTEE_CSV_EXPORT_EXAMPLE: Partial<CommitteeCsvPort>[] = [
    {
        name: `Finance committee`,
        forward_to_committee_ids: `Confederation congress`,
        organization_tag_ids: `Finance`,
        meeting: 1
    },
    {
        name: `Confederation congress`,
        description: `Used to manage resolutions`,
        forward_to_committee_ids: `General assembly`,
        organization_tag_ids: `Independent`,
        manager_ids: `Max Mustermann`,
        meeting: `General meeting`,
        meeting_start_date: `2021-12-17`,
        meeting_end_date: `2021-12-19`,
        meeting_admin_ids: `Max Mustermann`
    },
    {
        name: `General assembly`,
        description: `This committee meets once a year. It is the highest decision-making one.`,
        forward_to_committee_ids: `General assembly`,
        organization_tag_ids: `Independent`,
        meeting_template_id: `General main assembly`
    }
];
