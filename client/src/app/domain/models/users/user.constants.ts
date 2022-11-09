import { User } from './user';

export const userHeadersAndVerboseNames: { [key in keyof User]?: any } = {
    title: `Title`,
    first_name: `Given name`,
    last_name: `Surname`,
    email: `Email`,
    pronoun: `Pronoun`,
    gender: `Gender`,
    username: `Username`,
    default_password: `Initial password`,
    is_active: `Active`,
    is_physical_person: `Natural person`
};
