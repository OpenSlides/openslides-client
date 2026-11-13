import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

interface GetForwardMeetingsPresenterPayload {
    meeting_id: Id;
}

export interface GetForwardingMeetingsPresenterMeeting {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
}

export interface GetForwardingMeetingsPresenter {
    id: Id;
    name: string;
    default_meeting_id?: Id;
    meetings?: GetForwardingMeetingsPresenterMeeting[];
}

type GetForwardingMeetingsPresenterResult = GetForwardingMeetingsPresenter[];

@Service()
export class GetForwardingMeetingsPresenterService {
    private presenter = inject(PresenterService);

    public async call(payload: GetForwardMeetingsPresenterPayload): Promise<GetForwardingMeetingsPresenterResult> {
        return await this.presenter.call<GetForwardingMeetingsPresenterResult>(
            Presenter.GET_FORWARDING_MEETINGS,
            payload
        );
    }
}
