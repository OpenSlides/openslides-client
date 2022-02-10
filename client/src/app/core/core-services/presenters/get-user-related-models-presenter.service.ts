import { Injectable } from '@angular/core';
import { Id } from 'app/core/definitions/key-types';

import { CML } from '../organization-permission';
import { Presenter, PresenterService } from '../presenter.service';

export interface GetUserRelatedModelsUser {
    name?: string;
    meetings?: {
        id: Id;
        is_active_in_organization_id: Id;
        name: string;
        candidate_ids: Id[];
        speaker_ids: Id[];
        submitter_ids: Id[];
    }[];
    committees?: GetUserRelatedModelsCommittee[];
}

export interface GetUserRelatedModelsCommittee {
    id: Id;
    name: string;
    cml: CML;
}

export interface GetUserRelatedModelsPresenterResult {
    [user_id: number]: GetUserRelatedModelsUser;
}

@Injectable({ providedIn: `root` })
export class GetUserRelatedModelsPresenterService {
    public constructor(private presenter: PresenterService) {}

    public async call(data: { user_ids: Id[] }): Promise<GetUserRelatedModelsPresenterResult> {
        return await this.presenter.call<GetUserRelatedModelsPresenterResult>(Presenter.GET_USER_RELATED_MODELS, data);
    }
}
