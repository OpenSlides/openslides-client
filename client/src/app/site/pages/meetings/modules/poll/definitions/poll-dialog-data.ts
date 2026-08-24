import { Fqid } from '@app/domain/definitions/key-types';
import { BaseModel } from '@app/domain/models/base/base-model';
import { Poll } from '@app/domain/models/poll/poll';

export interface PollDialogData {
    // Required
    title: string;
    type: string;
    pollmethod: string;
    content_object_id?: Fqid;
    content_object: BaseModel;
    poll?: Poll;

    isPublished?: boolean;
    onehundred_percent_base?: string;
}
