import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

interface ExportMeetingPresenterPayload {
    meeting_id: Id;
}

interface JsonBlob {
    [key: string]: JsonBlobValueType | JsonBlobValueType[] | null;
}

type JsonBlobValueType = JsonBlob | string | number | boolean;

@Injectable({
    providedIn: `root`
})
export class ExportMeetingPresenterService {
    public constructor(private presenter: PresenterService) {}

    public async call(payload: ExportMeetingPresenterPayload): Promise<JsonBlob> {
        return await this.presenter.call(Presenter.EXPORT_MEETING, payload);
    }
}
