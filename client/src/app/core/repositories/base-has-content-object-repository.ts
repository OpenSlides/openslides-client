import { BaseModelWithContentObject } from 'app/shared/models/base/base-model-with-content-object';
import { BaseViewModel, TitleInformation } from 'app/site/base/base-view-model';
import { BaseViewModelWithContentObject } from 'app/site/base/base-view-model-with-content-object';
import { BaseRepository } from './base-repository';

/**
 * A base repository for objects that *have* content objects, e.g. items and lists of speakers.
 * Ensures that these objects must have a content objects via generics and adds a way of
 * efficient querying objects by their content objects:
 * If one wants to have the object for "motions/motion:1", call `findByContentObject` with
 * these information represented as a fqid.
 */
export abstract class BaseHasContentObjectRepository<
    V extends BaseViewModelWithContentObject<M, C> & T,
    M extends BaseModelWithContentObject,
    C extends BaseViewModel,
    T extends TitleInformation
> extends BaseRepository<V, M, T> {
    protected contentObjectIdMapping: {
        [fqid: string]: V;
    } = {};

    /**
     * Returns the object with has the given content object as the content object.
     *
     * @param contentObjectId The content object (fqid) to query.
     */
    public findByContentObjectId(contentObjectId: string): V | null {
        return this.contentObjectIdMapping[contentObjectId] || null;
    }

    /**
     * @override
     */
    public changedModels(ids: number[]): void {
        ids.forEach(id => {
            const v = this.createViewModel(this.DS.get(this.collection, id));
            this.viewModelStore[id] = v;

            this.contentObjectIdMapping[v.contentObjectId] = v;
            this.updateViewModelObservable(id);
        });
    }

    /**
     * @override
     */
    public deleteModels(ids: number[]): void {
        ids.forEach(id => {
            const v = this.viewModelStore[id];
            if (v) {
                delete this.contentObjectIdMapping[v.contentObjectId];
            }
            delete this.viewModelStore[id];
            this.updateViewModelObservable(id);
        });
    }
}
