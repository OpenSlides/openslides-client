import { Injectable } from '@angular/core';

import { Id } from '../domain/definitions/key-types';
import { ViewMediafile } from '../site/pages/meetings/pages/mediafiles';
import { ActionService } from './actions';

type MediaAdapterActionParameters = ({ action: `set`; mediafile: ViewMediafile } | { action: `unset` }) & {
    type: `logo` | `font`;
    place: string;
};

@Injectable({
    providedIn: `root`
})
export class MeetingMediaAdapterService {
    public constructor(private actionService: ActionService) {}

    public setLogo(place: string, meetingId: Id, mediafile: ViewMediafile): Promise<void> {
        return this.performAction(meetingId, { action: `set`, type: `logo`, place, mediafile });
    }

    public unsetLogo(place: string, meetingId: Id): Promise<void> {
        return this.performAction(meetingId, { action: `unset`, type: `logo`, place });
    }

    public setFont(place: string, meetingId: Id, mediafile: ViewMediafile): Promise<void> {
        return this.performAction(meetingId, { action: `set`, type: `font`, place, mediafile });
    }

    public unsetFont(place: string, meetingId: Id): Promise<void> {
        return this.performAction(meetingId, { action: `unset`, type: `font`, place });
    }

    private async performAction(meetingId: Id, param: MediaAdapterActionParameters): Promise<void> {
        const data: any[] = [
            {
                ...(param.action === `set`
                    ? {
                          id: meetingId,
                          mediafile_id: param.mediafile.id
                      }
                    : { id: meetingId }),
                place: param.place
            }
        ];
        await this.actionService.createFromArray([{ action: `meeting.${param.action}_${param.type}`, data }]).resolve();
    }
}
