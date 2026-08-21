import { Identifiable } from '@app/domain/interfaces';
import { EntitledUsersEntry } from '@app/domain/models/poll/poll-constants';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';

export interface EntitledUsersTableEntry extends EntitledUsersEntry, Identifiable {
    user?: ViewUser;
    voted_verbose: string;
    vote_delegated_to?: ViewUser | null;
    user_merged_into?: string | null;
    delegation_user_merged_into?: string | null;
}
