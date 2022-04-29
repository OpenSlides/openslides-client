import { Id } from '../definitions/key-types';

export interface HasTagIds {
    tag_ids: Id[]; // (tag/tagged_ids)[];
}
