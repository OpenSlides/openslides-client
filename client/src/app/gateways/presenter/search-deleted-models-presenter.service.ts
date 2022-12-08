import { Injectable } from '@angular/core';
import { Collection, Id } from 'src/app/domain/definitions/key-types';
import { BaseModel } from 'src/app/domain/models/base/base-model';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

interface SearchDeletedModelsPresenterResponse {
    [id: number]: Partial<BaseModel>;
}

@Injectable({
    providedIn: `root`
})
export class SearchDeletedModelsPresenterService {
    public constructor(private presenter: PresenterService) {}

    public async call(data: {
        collection: Collection;
        filter_string: string;
        meeting_id: Id;
    }): Promise<SearchDeletedModelsPresenterResponse> {
        return await this.presenter.call<SearchDeletedModelsPresenterResponse>(Presenter.SEARCH_DELETED_MODELS, data);
    }
}
