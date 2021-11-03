import { Fqid, Id } from 'app/core/definitions/key-types';

import { BaseModel } from '../base/base-model';
import { HasMeetingId } from '../base/has-meeting-id';

/**
 * Representation of a tag.
 * @ignore
 */
export class Tag extends BaseModel<Tag> {
    public static COLLECTION = `tag`;

    public id: Id;
    public name: string;

    public tagged_ids: Fqid[]; // (*/tag_ids)[];

    public constructor(input?: any) {
        super(Tag.COLLECTION, input);
    }
}
export interface Tag extends HasMeetingId {}
