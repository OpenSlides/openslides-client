import { CommitteeCsvPort } from 'src/app/domain/models/comittees/committee.constants';

export const COMMITTEE_CSV_EXPORT_EXAMPLE: Partial<CommitteeCsvPort>[] = [
    {
        name: `Finance committee`,
        forward_to_committees: `Confederation congress`,
        organization_tags: `Finance`,
        meeting_name: 1
    },
    {
        name: `Confederation congress`,
        description: `Used to manage resolutions`,
        forward_to_committees: `General assembly`,
        organization_tags: `Independent`,
        managers: `Max Mustermann`,
        meeting_name: `General meeting`,
        meeting_start_time: `2021-12-17`,
        meeting_end_time: `2021-12-19`,
        meeting_admins: `Max Mustermann`
    },
    {
        name: `General assembly`,
        description: `This committee meets once a year. It is the highest decision-making one.`,
        forward_to_committees: `General assembly`,
        organization_tags: `Independent`,
        meeting_template: `General main assembly`
    }
];
