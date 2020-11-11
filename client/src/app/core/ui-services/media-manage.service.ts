import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { ActionService } from '../core-services/action.service';
import { ActiveMeetingService } from '../core-services/active-meeting.service';
import { Id } from '../definitions/key-types';
import { MediafileAction } from '../actions/mediafile-action';
import { MeetingAction } from '../actions/meeting-action';
import { ViewMediafile } from '../../site/mediafiles/models/view-mediafile';

export type LogoPlace =
    | 'projector_main'
    | 'projector_header'
    | 'web_header'
    | 'pdf_header_L'
    | 'pdf_header_R'
    | 'pdf_footer_L'
    | 'pdf_footer_R'
    | 'pdf_ballot_paper';
export const LogoDisplayNames: { [place in LogoPlace]: string } = {
    projector_main: 'Projector logo',
    projector_header: 'Projector header image',
    web_header: 'Web interface header logo',
    pdf_header_L: 'PDF header logo (left)',
    pdf_header_R: 'PDF header logo (right)',
    pdf_footer_L: 'PDF footer logo (left)',
    pdf_footer_R: 'PDF footer logo (right)',
    pdf_ballot_paper: 'PDF ballot paper logo'
};

export type FontPlace = 'regular' | 'italic' | 'bold' | 'bold_italic' | 'monospace';
export const FontDisplayNames: { [place in FontPlace]: string } = {
    regular: 'Font regular',
    italic: 'Font italic',
    bold: 'Font bold',
    bold_italic: 'Font bold italic',
    monospace: 'Font monospace'
};
export const FontDefaults: { [place in FontPlace]: string } = {
    regular: 'assets/fonts/fira-sans-latin-400.woff',
    italic: 'assets/fonts/fira-sans-latin-400italic.woff',
    bold: 'assets/fonts/fira-sans-latin-500.woff',
    bold_italic: 'assets/fonts/fira-sans-latin-500italic.woff',
    monospace: 'assets/fonts/roboto-condensed-bold.woff'
};

/**
 * The service to manage Mediafiles.
 *
 * Declaring images as logos (web, projector, pdf, ...) is handles here.
 */
@Injectable({
    providedIn: 'root'
})
export class MediaManageService {
    public get allLogoPlaces(): LogoPlace[] {
        return [
            'projector_main',
            'projector_header',
            'web_header',
            'pdf_header_L',
            'pdf_header_R',
            'pdf_footer_L',
            'pdf_footer_R',
            'pdf_ballot_paper'
        ];
    }

    public get allFontPlaces(): FontPlace[] {
        return ['regular', 'italic', 'bold', 'bold_italic', 'monospace'];
    }

    private readonly logoUrlSubjects: { [place in LogoPlace]?: BehaviorSubject<string | null> } = {};
    private readonly fontUrlSubjects: { [place in FontPlace]?: BehaviorSubject<string> } = {};

    /**
     * Constructor for the MediaManage service
     *
     * @param httpService OpenSlides own HttpService
     */
    public constructor(private activeMeetingService: ActiveMeetingService, private actionService: ActionService) {
        this.activeMeetingService.meetingObservable.subscribe(_ => {
            for (const place of Object.keys(this.logoUrlSubjects)) {
                this.logoUrlSubjects[place].next(this.getLogoUrl(place as LogoPlace));
            }
            for (const place of Object.keys(this.fontUrlSubjects)) {
                this.fontUrlSubjects[place].next(this.getFontUrl(place as FontPlace));
            }
        });
    }

    public async setLogo(place: LogoPlace, mediafile: ViewMediafile): Promise<void> {
        const payload: MeetingAction.SetLogoPayload = {
            id: this.activeMeetingService.meetingId,
            mediafile_id: mediafile.id,
            place
        };
        return this.actionService.sendRequest(MeetingAction.SET_LOGO, payload);
    }

    public async unsetLogo(place: LogoPlace): Promise<void> {
        const payload: MeetingAction.UnsetLogoPayload = {
            id: this.activeMeetingService.meetingId,
            place
        };
        return this.actionService.sendRequest(MeetingAction.UNSET_LOGO, payload);
    }

    public async setFont(place: FontPlace, mediafile: ViewMediafile): Promise<void> {
        const payload: MeetingAction.SetFontPayload = {
            id: this.activeMeetingService.meetingId,
            mediafile_id: mediafile.id,
            place
        };
        return this.actionService.sendRequest(MeetingAction.SET_FONT, payload);
    }

    public async unsetFont(place: FontPlace): Promise<void> {
        const payload: MeetingAction.UnsetFontPayload = {
            id: this.activeMeetingService.meetingId,
            place
        };
        return this.actionService.sendRequest(MeetingAction.UNSET_FONT, payload);
    }

    public getLogoUrlObservable(place: LogoPlace): Observable<string> {
        if (!this.logoUrlSubjects[place]) {
            this.logoUrlSubjects[place] = new BehaviorSubject(this.getLogoUrl(place));
        }
        return this.logoUrlSubjects[place].asObservable();
    }

    public getLogoUrl(place: LogoPlace): string | null {
        // Note: we are not fetching the mediafile view model at any place.
        const mediafileId = this.activeMeetingService.meeting?.logo_id(place);
        if (mediafileId) {
            return this.getUrlForId(mediafileId);
        } else {
            return null;
        }
    }

    public getFontUrlObservable(place: FontPlace): Observable<string> {
        if (!this.fontUrlSubjects[place]) {
            this.fontUrlSubjects[place] = new BehaviorSubject(this.getFontUrl(place));
        }
        return this.fontUrlSubjects[place].asObservable();
    }

    public getFontUrl(place: FontPlace): string {
        // Note: we are not fetching the mediafile view model at any place.
        const mediafileId = this.activeMeetingService.meeting?.font_id(place);
        if (mediafileId) {
            return this.getUrlForId(mediafileId);
        } else {
            return FontDefaults[place];
        }
    }

    public getPlacesDisplayNames(mediafile: ViewMediafile): string[] {
        let uses = [];
        uses = uses.concat((mediafile.used_as_logo_$_in_meeting_id || []).map(place => LogoDisplayNames[place]));
        uses = uses.concat((mediafile.used_as_font_$_in_meeting_id || []).map(place => FontDisplayNames[place]));
        return uses;
    }

    private getUrlForId(id: Id): string {
        return `/system/media/get/${id}`;
    }
}
