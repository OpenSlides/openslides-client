import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

interface GetForwardCommitteesPresenterPayload {
    meeting_id: Id;
}

type GetForwardingCommitteesPresenterResult = string[];

@Service()
export class GetForwardingCommitteesPresenterService {
    private presenter = inject(PresenterService);

    public async call(payload: GetForwardCommitteesPresenterPayload): Promise<GetForwardingCommitteesPresenterResult> {
        return await this.presenter.call<GetForwardingCommitteesPresenterResult>(
            Presenter.GET_FORWARDING_COMMITTEES,
            payload
        );
    }
}
