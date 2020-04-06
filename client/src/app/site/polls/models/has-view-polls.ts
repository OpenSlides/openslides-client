import { BaseViewPoll } from './base-view-poll';

export interface HasViewPolls<T extends BaseViewPoll> {
    polls: T[];
}
