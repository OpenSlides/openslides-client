import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

interface ExportMeetingPresenterPayload {
    meeting_id: Id;
}

interface JsonBlob {
    [key: string]: JsonBlobValueType | JsonBlobValueType[] | null;
}

type JsonBlobValueType = JsonBlob | string | number | boolean;

@Service()
export class ExportMeetingPresenterService {
    private presenter = inject(PresenterService);

    public async call(payload: ExportMeetingPresenterPayload): Promise<JsonBlob> {
        return await this.presenter.call(Presenter.EXPORT_MEETING, payload);
    }
}
