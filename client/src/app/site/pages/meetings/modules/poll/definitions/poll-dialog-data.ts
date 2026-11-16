import { HasMeetingId } from '@app/domain/interfaces';
import { BaseModel } from '@app/domain/models/base/base-model';

export interface PollDialogData {
    title: string;
    content_object: BaseModel & HasMeetingId;

    entitled_group_ids: number[];
    live_voting_enabled: boolean;
}
