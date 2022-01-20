import { DirectoryObservableProvider } from 'app/shared/components/file-management-list/file-management-list.component';
import { HasParentId } from 'app/shared/models/base/has-parent-id';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseRepository } from '../../../core/repositories/base-repository';
import { BaseViewModel } from '../../../site/base/base-view-model';

export class DirectoryObservableProviderImplementation<V extends HasParentId & BaseViewModel>
    implements DirectoryObservableProvider<V>
{
    public constructor(private readonly repo: BaseRepository<V, any>) {}

    public getDirectoryListObservable(directoryId: number): Observable<V[]> {
        return this.repo.getViewModelListObservable().pipe(
            map(viewModels =>
                viewModels.filter(viewModel => {
                    if (!directoryId && !viewModel.parent_id) {
                        return true;
                    } else {
                        return viewModel.parent_id === directoryId;
                    }
                })
            )
        );
    }
}
