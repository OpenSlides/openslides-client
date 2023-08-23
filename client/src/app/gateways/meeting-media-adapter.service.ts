import { Injectable } from '@angular/core';

import { Id } from '../domain/definitions/key-types';
import { ViewMediafile } from '../site/pages/meetings/pages/mediafiles';
import { ActionService } from './actions';

type MediaAdapterActionParameters = (
    | { action: `set`; mediafile: ViewMediafile }
    | { action: `unset`; meetingId: Id }
) & { type: `logo` | `font`; place: string };

@Injectable({
    providedIn: `root`
})
export class MeetingMediaAdapterService {
    public constructor(private actionService: ActionService) {}

    public setLogo(place: string, mediafile: ViewMediafile): Promise<void> {
        return this.performAction({ action: `set`, type: `logo`, place, mediafile });
    }

    public unsetLogo(place: string, meetingId: Id): Promise<void> {
        return this.performAction({ action: `unset`, type: `logo`, place, meetingId });
    }

    public setFont(place: string, mediafile: ViewMediafile): Promise<void> {
        return this.performAction({ action: `set`, type: `font`, place, mediafile });
    }

    public unsetFont(place: string, meetingId: Id): Promise<void> {
        return this.performAction({ action: `unset`, type: `font`, place, meetingId });
    }

    private async performAction(param: MediaAdapterActionParameters): Promise<void> {
        const data: any = {
            ...(param.action === `set`
                ? {
                      id: param.mediafile.meeting_id,
                      mediafile_id: param.mediafile.id
                  }
                : { id: param.meetingId }),
            place: param.place
        };
        await this.actionService.createFromArray([{ action: `meeting.${param.action}_${param.type}`, data }]).resolve();
    }
}
