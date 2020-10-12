import { Id } from 'app/core/definitions/key-types';
import { BaseDecimalModel } from '../base/base-decimal-model';
import { HasMeetingId } from '../base/has-meeting-id';

export abstract class BaseOption<T> extends BaseDecimalModel<T> {
    public id: Id;
    public yes: number;
    public no: number;
    public abstain: number;

    public poll_id: Id; // (assignment|motion)_poll/option_ids;
    public vote_ids: Id; // ((assignment|motion)_vote/option_id)[];

    protected getDecimalFields(): string[] {
        return ['yes', 'no', 'abstain'];
    }
}
export interface BaseOption<T> extends HasMeetingId {}
