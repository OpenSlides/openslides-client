import { BaseViewModel, ViewModelConstructor } from 'src/app/site/base/base-view-model';
import { BaseModel, ModelConstructor } from 'src/app/domain/models/base/base-model';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
/**
 * Unifies the ModelConstructor and ViewModelConstructor.
 */
interface UnifiedConstructors {
    COLLECTION: string;
    new (...args: any[]): any;
}

export interface CollectionMappedTypes<V extends BaseViewModel, M extends BaseModel> {
    modelConstructor: ModelConstructor<M>;
    viewModelConstructor: ViewModelConstructor<V>;
    repository: BaseRepository<V, M>;
}

/**
 * Every types supported: (View)ModelConstructors, repos and collections.
 */
export type CollectionType = UnifiedConstructors | BaseRepository<any, any> | string;
