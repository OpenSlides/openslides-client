import { UserExport } from '../../../../../../domain/models/users/user.export';

export const AccountCsvExportExample: UserExport[] = [
    {
        title: `Dr.`,
        first_name: `Max`,
        last_name: `Mustermann`,
        is_active: true,
        is_physical_person: true,
        default_password: `initialPassword`,
        username: `mmustermann`,
        gender: `male`,
        default_vote_weight: 1.0,
        member_number: `123456`
    },
    {
        first_name: `John`,
        last_name: `Doe`,
        is_active: true,
        is_physical_person: true,
        email: `john.doe@email.com`,
        username: `jdoe`,
        gender: `diverse`,
        default_vote_weight: 2.0,
        member_number: `234`
    },
    {
        first_name: `Julia`,
        last_name: `Bloggs`,
        username: `jbloggs`,
        gender: `female`,
        default_vote_weight: 1.5,
        member_number: `5678`
    },
    {
        last_name: `Executive Board`,
        username: `executive`,
        default_vote_weight: 2.5,
        member_number: `6789`
    }
];
