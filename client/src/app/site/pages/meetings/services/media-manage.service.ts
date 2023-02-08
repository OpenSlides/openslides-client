import { Injectable } from '@angular/core';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import {
    FontDefaults,
    FontDisplayNames,
    FontPlace,
    FontPlaces,
    LogoDisplayNames,
    LogoPlace,
    LogoPlaces
} from 'src/app/domain/models/mediafiles/mediafile.constants';
import { MeetingMediaAdapterService } from 'src/app/gateways/meeting-media-adapter.service';
import { MediafileRepositoryService } from 'src/app/gateways/repositories/mediafiles/mediafile-repository.service';

import { ViewMediafile } from '../pages/mediafiles';
import { ActiveMeetingService } from './active-meeting.service';

@Injectable({
    providedIn: `root`
})
export class MediaManageService {
    public get allLogoPlaces(): LogoPlace[] {
        return LogoPlaces;
    }

    public get allFontPlaces(): FontPlace[] {
        return FontPlaces;
    }

    private readonly logoUrlSubjects: { [place in LogoPlace]?: BehaviorSubject<string | null> } = {};
    private readonly fontUrlSubjects: { [place in FontPlace]?: BehaviorSubject<string> } = {};

    public constructor(
        private activeMeetingService: ActiveMeetingService,
        private mediaAdapter: MeetingMediaAdapterService,
        private mediaRepo: MediafileRepositoryService
    ) {
        merge(this.activeMeetingService.meetingObservable, this.mediaRepo.getViewModelListUnsafeObservable()).subscribe(
            _ => {
                for (const place of Object.keys(this.logoUrlSubjects)) {
                    (<any>this.logoUrlSubjects)[place].next(this.getLogoUrl(place as LogoPlace));
                }
                for (const place of Object.keys(this.fontUrlSubjects)) {
                    (<any>this.fontUrlSubjects)[place].next(this.getFontUrl(place as FontPlace));
                }
            }
        );
    }

    public getLogoUrlObservable(place: LogoPlace): Observable<string> {
        if (!this.logoUrlSubjects[place]) {
            this.logoUrlSubjects[place] = new BehaviorSubject(this.getLogoUrl(place));
        }
        return this.logoUrlSubjects[place]!.asObservable() as Observable<string>;
    }

    public getLogoUrl(place: LogoPlace): string | null {
        // Note: we are not fetching the mediafile view model at any place except when filtering for the defaults.
        const mediafileId = this.activeMeetingService.meetingId
            ? this.activeMeetingService.meeting?.logo_id(place)
            : null;
        const generalMediafileId = this.getGlobalMediafileIdByToken(place);
        if (mediafileId) {
            return this.getUrlForId(mediafileId);
        } else if (generalMediafileId) {
            return this.getUrlForId(generalMediafileId);
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
        if (mediafileId) {
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

    private getGlobalMediafileIdByToken(place: LogoPlace | FontPlace): number {
        return (
            this.mediaRepo.getViewModelListUnsafe().find(file => {
                return (
                    file.isImage() && Object.keys(LogoDisplayNames).includes(place) && file.token === `global-${place}`
                );
            })?.id ?? null
        );
    }

    private getUrlForId(id: Id): string {
        return `/system/media/get/${id}`;
    }
}
