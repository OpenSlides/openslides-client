import { Injectable } from '@angular/core';

import { Id } from '../../domain/definitions/key-types';
import { CML, OML } from '../../domain/definitions/organization-permission';
import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

export interface GetUserRelatedModelsUser {
    organization_management_level?: OML;
    meetings?: {
        id: Id;
        is_active_in_organization_id: Id;
        name: string;
        assignment_candidate_ids: Id[];
        speaker_ids: Id[];
        motion_submitter_ids: Id[];
    }[];
    committees?: GetUserRelatedModelsCommittee[];
    error?: string; // This is in case the presenter fails in an unpredicted way
}

export interface GetUserRelatedModelsCommittee {
    id: Id;
    name: string;
    cml: CML | ``;
}

export interface GetUserRelatedModelsPresenterResult {
    [user_id: number]: GetUserRelatedModelsUser;
}

@Injectable({
    providedIn: `root`
})
export class GetUserRelatedModelsPresenterService {
    public constructor(private presenter: PresenterService) {}

    public async call(data: { user_ids: Id[] }): Promise<GetUserRelatedModelsPresenterResult> {
        return await this.presenter.call<GetUserRelatedModelsPresenterResult>(Presenter.GET_USER_RELATED_MODELS, data);
    }
}
