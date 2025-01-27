import { Identifiable } from 'src/app/domain/interfaces';
import { EntitledUsersEntry } from 'src/app/domain/models/poll/poll-constants';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

export interface EntitledUsersTableEntry extends EntitledUsersEntry, Identifiable {
    user?: ViewUser;
    vote_delegated_to?: ViewUser | null;
    user_merged_into?: string | null;
    delegation_user_merged_into?: string | null;
}
