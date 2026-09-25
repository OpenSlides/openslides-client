import { UserExport } from '../../../../../../domain/models/users/user.export';

export const AccountCsvExportExample: UserExport[] = [
    {
        first_name: `Max`,
        last_name: `Musterhuman`,
        email: `max@example.com`,
        is_active: true,
        is_physical_person: true,
        gender: `diverse`,
        default_vote_weight: 1.0,
        member_number: `123456`
    }
];
