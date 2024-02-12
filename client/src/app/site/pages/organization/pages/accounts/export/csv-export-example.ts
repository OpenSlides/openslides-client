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
        default_structure_level: `Berlin`,
        default_vote_weight: 1.0
    },
    {
        first_name: `John`,
        last_name: `Doe`,
        default_structure_level: `Washington`,
        is_active: true,
        is_physical_person: true,
        email: `john.doe@email.com`,
        username: `jdoe`,
        gender: `diverse`,
        default_vote_weight: 2.0
    },
    {
        first_name: `Julia`,
        last_name: `Bloggs`,
        default_structure_level: `London`,
        username: `jbloggs`,
        gender: `female`,
        default_vote_weight: 1.5
    },
    {
        last_name: `Executive Board`,
        username: `executive`,
        default_vote_weight: 2.5
    }
];
