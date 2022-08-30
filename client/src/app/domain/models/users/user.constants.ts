import { User } from './user';

export const userHeadersAndVerboseNames: { [key in keyof User]?: any } = {
    title: `Title`,
    first_name: `Given name`,
    last_name: `Surname`,
    is_active: `Active`,
    is_physical_person: `Natural person`,
    default_password: `Initial password`,
    email: `Email`,
    username: `Username`,
    gender: `Gender`,
    pronoun: `Pronoun`
};
