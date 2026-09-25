import { Tag } from '@app/domain/models/tag/tag';
import { BaseViewModel } from '@app/site/base/base-view-model';
import { HasMeeting } from '@app/site/pages/meetings/view-models/has-meeting';

import { HasTags } from './has-tags';

export class ViewTag extends BaseViewModel<Tag> /* implements Searchable */ {
    public static COLLECTION = Tag.COLLECTION;
    protected _collection = Tag.COLLECTION;

    public get tag(): Tag {
        return this._model;
    }

    public override getDetailStateUrl(): string {
        return `${this.getActiveMeetingId()}/tags`;
    }
}
interface ViewTagRelations {
    tagged: (BaseViewModel & HasTags)[];
}
export interface ViewTag extends Tag, ViewTagRelations, HasMeeting {}
