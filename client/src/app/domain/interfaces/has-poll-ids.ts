import { Id } from '@app/domain/definitions/key-types';

export interface HasPollIds {
    poll_ids: Id[]; // (poll/content_object_id)[];
}
