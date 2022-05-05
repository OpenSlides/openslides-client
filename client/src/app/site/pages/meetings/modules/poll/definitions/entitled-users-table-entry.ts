import { EntitledUsersEntry } from 'src/app/domain/models/poll/poll-constants';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { Identifiable } from 'src/app/domain/interfaces';

export interface EntitledUsersTableEntry extends EntitledUsersEntry, Identifiable {
    user?: ViewUser;
    voted_verbose: string;
    vote_delegated_to?: ViewUser | null;
}
