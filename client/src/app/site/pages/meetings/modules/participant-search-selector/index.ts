import { RawUser } from 'src/app/gateways/repositories/users';

export * from './participant-search-selector.module';

export interface UserSelectionData {
    userId: number;
    user?: RawUser;
}
