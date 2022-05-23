import { Fqid } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';

export class Tag extends BaseModel<Tag> {
    public static COLLECTION = `tag`;

    public name!: string;

    public tagged_ids!: Fqid[]; // (*/tag_ids)[];

    public constructor(input?: any) {
        super(Tag.COLLECTION, input);
    }
}
export interface Tag extends HasMeetingId {}
