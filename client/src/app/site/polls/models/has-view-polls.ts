import { ViewPoll } from 'app/shared/models/poll/view-poll';

export interface HasViewPolls<T extends ViewPoll> {
    polls: T[];
}
