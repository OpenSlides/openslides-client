import { Id } from 'app/core/definitions/key-types';

export interface HasProjectionIds {
    projection_ids: Id[]; // (projection/content_object_id)[];
}
