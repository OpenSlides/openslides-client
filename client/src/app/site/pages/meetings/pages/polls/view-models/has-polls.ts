import { ViewPoll } from './view-poll';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

export function isHavingViewPolls(instance: any): instance is HasPolls {
    return !!instance?.polls;
}

export interface HasPolls<C extends BaseViewModel = any> {
    polls: ViewPoll<C>[];
}
