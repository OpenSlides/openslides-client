import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

/**
 * Representation of a tag.
 * @ignore
 */
export class Tag extends BaseModel<Tag> {
    public static COLLECTION = 'tag';

    public id: Id;
    public name: string;

    public tagged_ids: Id[]; // (*/tag_ids)[];
    public meeting_id: Id; // meeting/tag_ids;

    public constructor(input?: any) {
        super(Tag.COLLECTION, input);
    }
}
