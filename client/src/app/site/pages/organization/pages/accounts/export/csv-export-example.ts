import { UserExport } from '../../../../../../domain/models/users/user.export';

export const AccountCsvExportExample: UserExport[] = [
    {
        first_name: `Max`,
        last_name: `Mustermann`,
        email: `max@example.com`,
        is_active: true,
        is_physical_person: true,
        gender: `male`,
        default_vote_weight: 1.0,
        member_number: `123456`
    }
];
