import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import {
    FontDefaults,
    FontDisplayNames,
    FontPlace,
    LogoDisplayNames,
    LogoPlace
} from 'src/app/domain/models/mediafiles/mediafile.constants';
import { MeetingMediaAdapterService } from 'src/app/gateways/meeting-media-adapter.service';

import { ViewMediafile } from '../pages/mediafiles';
import { ActiveMeetingService } from './active-meeting.service';

@Injectable({
    providedIn: `root`
})
export class MediaManageService {
    public get allLogoPlaces(): LogoPlace[] {
        return [
            `projector_main`,
            `projector_header`,
            `web_header`,
            `pdf_header_l`,
            `pdf_header_r`,
            `pdf_footer_l`,
            `pdf_footer_r`,
            `pdf_ballot_paper`
        ];
    }

    public get allFontPlaces(): FontPlace[] {
        return [
            `regular`,
            `italic`,
            `bold`,
            `bold_italic`,
            `monospace`,
            `chyron_speaker_name`,
            `projector_h1`,
            `projector_h2`
        ];
    }

    private readonly logoUrlSubjects: { [place in LogoPlace]?: BehaviorSubject<string | null> } = {};
    private readonly fontUrlSubjects: { [place in FontPlace]?: BehaviorSubject<string> } = {};

    public constructor(
        private activeMeetingService: ActiveMeetingService,
        private mediaAdapter: MeetingMediaAdapterService
    ) {
        this.activeMeetingService.meetingObservable.subscribe(_ => {
            for (const place of Object.keys(this.logoUrlSubjects)) {
                (<any>this.logoUrlSubjects)[place].next(this.getLogoUrl(place as LogoPlace));
            }
            for (const place of Object.keys(this.fontUrlSubjects)) {
                (<any>this.fontUrlSubjects)[place].next(this.getFontUrl(place as FontPlace));
            }
        });
    }

    public getLogoUrlObservable(place: LogoPlace): Observable<string> {
        if (!this.logoUrlSubjects[place]) {
            this.logoUrlSubjects[place] = new BehaviorSubject(this.getLogoUrl(place));
        }
        return this.logoUrlSubjects[place]!.asObservable() as Observable<string>;
    }

    public getLogoUrl(place: LogoPlace): string | null {
        // Note: we are not fetching the mediafile view model at any place.
        const mediafileId = this.activeMeetingService.meeting?.logo_id(place);
        if (mediafileId && this.activeMeetingService.meeting?.logo_$_id.indexOf(place) !== -1) {
            return this.getUrlForId(mediafileId);
        } else {
            return null;
        }
    }

    public getFontUrlObservable(place: FontPlace): Observable<string> {
        if (!this.fontUrlSubjects[place]) {
            this.fontUrlSubjects[place] = new BehaviorSubject(this.getFontUrl(place));
        }
        return this.fontUrlSubjects[place]!.asObservable();
    }

    public getFontUrl(place: FontPlace): string {
        // Note: we are not fetching the mediafile view model at any place.
        const mediafileId = this.activeMeetingService.meeting?.font_id(place);
        if (mediafileId && this.activeMeetingService.meeting?.font_$_id.indexOf(place) !== -1) {
            return this.getUrlForId(mediafileId);
        } else {
            return FontDefaults[place];
        }
    }

    public getPlacesDisplayNames(mediafile: ViewMediafile): string[] {
        let uses: string[] = [];
        uses = uses.concat((mediafile.used_as_logo_$_in_meeting_id || []).map(place => (<any>LogoDisplayNames)[place]));
        uses = uses.concat((mediafile.used_as_font_$_in_meeting_id || []).map(place => (<any>FontDisplayNames)[place]));
        return uses;
    }

    public async setLogo(place: LogoPlace, mediafile: ViewMediafile): Promise<void> {
        await this.mediaAdapter.setLogo(place, mediafile);
    }

    public async unsetLogo(place: LogoPlace): Promise<void> {
        await this.mediaAdapter.unsetLogo(place, this.activeMeetingService.meetingId!);
    }

    public async setFont(place: FontPlace, mediafile: ViewMediafile): Promise<void> {
        await this.mediaAdapter.setFont(place, mediafile);
    }

    public async unsetFont(place: FontPlace): Promise<void> {
        await this.mediaAdapter.unsetFont(place, this.activeMeetingService.meetingId!);
    }

    private getUrlForId(id: Id): string {
        return `/system/media/get/${id}`;
    }
}
