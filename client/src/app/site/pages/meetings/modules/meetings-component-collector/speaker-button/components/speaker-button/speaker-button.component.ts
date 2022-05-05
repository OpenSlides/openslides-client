import { Component, Input, OnDestroy } from '@angular/core';
import { distinctUntilChanged, Subscription, Observable } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { HasListOfSpeakers, ViewListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';

@Component({
    selector: 'os-speaker-button',
    templateUrl: './speaker-button.component.html',
    styleUrls: ['./speaker-button.component.scss']
})
export class SpeakerButtonComponent implements OnDestroy {
    @Input()
    public set object(obj: (BaseViewModel & HasListOfSpeakers) | Observable<BaseViewModel & HasListOfSpeakers> | null) {
        this.cleanLosSub();
        if (obj instanceof Observable) {
            this.setupLosSub(obj);
        } else {
            this.listOfSpeakers = obj?.list_of_speakers || null;
        }
    }

    public listOfSpeakers: ViewListOfSpeakers | null = null;

    @Input()
    public disabled: boolean = false;

    @Input()
    public menuItem = false;

    public get listOfSpeakersUrl(): string {
        if (!this.disabled && this.listOfSpeakers) {
            return this.listOfSpeakers.getDetailStateUrl();
        }
        return ``;
    }

    public get icon(): string {
        return this.listOfSpeakers?.closed ? `voice_over_off` : `record_voice_over`;
    }

    public get tooltip(): string {
        return this.listOfSpeakers?.closed ? `The list of speakers is closed.` : `List of speakers`;
    }

    private losSub: Subscription | null = null;

    public readonly permission = Permission;

    public ngOnDestroy(): void {
        this.cleanLosSub();
    }

    private setupLosSub(observable: Observable<BaseViewModel & HasListOfSpeakers>): void {
        this.losSub = observable
            .pipe(distinctUntilChanged())
            .subscribe(los => (this.listOfSpeakers = los.list_of_speakers || null));
    }

    private cleanLosSub(): void {
        if (this.losSub) {
            this.losSub.unsubscribe();
            this.losSub = null;
        }
    }
}
