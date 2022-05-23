import { Injectable } from '@angular/core';

import { Id } from '../domain/definitions/key-types';
import { ViewMediafile } from '../site/pages/meetings/pages/mediafiles';
import { ActionService } from './actions';
import { MeetingAction } from './repositories/meetings';

@Injectable({
    providedIn: `root`
})
export class MeetingMediaAdapterService {
    public constructor(private actionService: ActionService) {}

    public async setLogo(place: string, mediafile: ViewMediafile): Promise<void> {
        const payload: any = {
            id: mediafile.meeting_id,
            mediafile_id: mediafile.id,
            place
        };
        return this.actionService.sendRequest(MeetingAction.SET_LOGO, payload);
    }

    public async unsetLogo(place: string, meetingId: Id): Promise<void> {
        const payload: any = {
            id: meetingId,
            place
        };
        return this.actionService.sendRequest(MeetingAction.UNSET_LOGO, payload);
    }

    public async setFont(place: string, mediafile: ViewMediafile): Promise<void> {
        const payload: any = {
            id: mediafile.meeting_id,
            mediafile_id: mediafile.id,
            place
        };
        return this.actionService.sendRequest(MeetingAction.SET_FONT, payload);
    }

    public async unsetFont(place: string, meetingId: Id): Promise<void> {
        const payload: any = {
            id: meetingId,
            place
        };
        return this.actionService.sendRequest(MeetingAction.UNSET_FONT, payload);
    }
}
