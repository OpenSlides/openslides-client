import { Identifiable } from '@app/domain/interfaces';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';

export interface EntitledUsersTableEntry extends Identifiable {
    user_id: number;
    present: boolean;
    user?: ViewUser;
    voted_verbose: string;
    vote_delegated_to?: ViewUser | null;
    user_merged_into?: string | null;
    delegation_user_merged_into?: string | null;
}
