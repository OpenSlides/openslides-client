import { Fqid } from 'src/app/domain/definitions/key-types';
import { HasMeetingId } from 'src/app/domain/interfaces';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { Poll } from 'src/app/domain/models/poll/poll';

export interface PollDialogData {
    // Required
    title: string;
    type: string;
    method: string;
    pollmethod: string;
    content_object_id?: Fqid;
    content_object: BaseModel & HasMeetingId;
    poll?: Poll;

    isPublished?: boolean;
    onehundred_percent_base?: string;
    live_voting_enabled?: boolean;
}
