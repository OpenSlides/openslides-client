import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

interface GetForwardMeetingsPresenterPayload {
    meeting_id: Id;
}

export interface GetForwardingMeetingsPresenterMeeting {
    id: string;
    name: string;
    start_time: number;
    end_time: number;
}

export interface GetForwardingMeetingsPresenter {
    id: Id;
    name: string;
    default_meeting_id?: Id;
    meetings?: GetForwardingMeetingsPresenterMeeting[];
}

type GetForwardingMeetingsPresenterResult = GetForwardingMeetingsPresenter[];

@Injectable({
    providedIn: `root`
})
export class GetForwardingMeetingsPresenterService {
    public constructor(private presenter: PresenterService) {}

    public async call(payload: GetForwardMeetingsPresenterPayload): Promise<GetForwardingMeetingsPresenterResult> {
        return await this.presenter.call<GetForwardingMeetingsPresenterResult>(
            Presenter.GET_FORWARDING_MEETINGS,
            payload
        );
    }
}
