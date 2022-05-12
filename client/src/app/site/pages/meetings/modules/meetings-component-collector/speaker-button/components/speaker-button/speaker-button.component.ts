import { Component, Input, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { distinctUntilChanged, Subscription, Observable, of } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { HasListOfSpeakers, ViewListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';

@Component({
    selector: 'os-speaker-button',
    templateUrl: './speaker-button.component.html',
    styleUrls: ['./speaker-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeakerButtonComponent implements OnDestroy {
    @Input()
    public set object(obj: (BaseViewModel & HasListOfSpeakers) | Observable<BaseViewModel & HasListOfSpeakers> | null) {
        this.cleanLosSub();
        if (obj instanceof Observable) {
            this.setupLosSub(obj);
        } else {
            this.setupLosObservable(obj);
        }
    }

    @Input()
    public disabled: boolean = false;

    @Input()
    public menuItem = false;

    public get currentListOfSpeakersObservable(): Observable<ViewListOfSpeakers> | null {
        return this._losObservable;
    }

    public readonly permission = Permission;

    public hasInitialized = true;

    private _losObservable: Observable<ViewListOfSpeakers | null> | null = of(null);
    private _losSub: Subscription | null = null;

    public constructor(private cd: ChangeDetectorRef) {}

    public ngOnDestroy(): void {
        this.cleanLosSub();
    }

    private setupLosSub(observable: Observable<BaseViewModel & HasListOfSpeakers>): void {
        this._losSub = observable
            .pipe(distinctUntilChanged())
            .subscribe(losWrapper => this.setupLosObservable(losWrapper));
    }

    private cleanLosSub(): void {
        if (this._losSub) {
            this._losSub.unsubscribe();
            this._losSub = null;
        }
    }

    private setupLosObservable(model: HasListOfSpeakers): void {
        if (model?.list_of_speakers_as_observable) {
            this._losObservable = model.list_of_speakers_as_observable;
        } else {
            this._losObservable = of(model?.list_of_speakers);
        }
    }
}
