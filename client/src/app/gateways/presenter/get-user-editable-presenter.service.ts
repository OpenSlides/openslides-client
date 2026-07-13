import { inject, Injectable } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

interface GetUserEditablePresenterPayload {
    user_ids: Id[];
    fields: string[];
}

type GetUserEditableIdentifiedScope = Record<string, [boolean, string?]>;

export type GetUserEditablePresenterResult = Record<Id, GetUserEditableIdentifiedScope>;

@Injectable({
    providedIn: `root`
})
export class GetUserEditablePresenterService {
    private presenter = inject(PresenterService);

    public async call(payload: GetUserEditablePresenterPayload): Promise<GetUserEditablePresenterResult> {
        return await this.presenter.call(Presenter.GET_USER_EDITABLE, payload);
    }
}
