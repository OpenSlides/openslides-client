import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { Permission } from '@app/domain/definitions/permission';
import { BaseViewModel } from '@app/site/base/base-view-model';
import { HasListOfSpeakers, ViewListOfSpeakers } from '@app/site/pages/meetings/pages/agenda';
import { OperatorService } from '@app/site/services/operator.service';
import { distinctUntilChanged, Observable, of, Subscription } from 'rxjs';

@Component({
    selector: `os-speaker-button`,
    templateUrl: `./speaker-button.component.html`,
    styleUrls: [`./speaker-button.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
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
    public disabled = false;

    @Input()
    public menuItem = false;

    public get currentListOfSpeakersObservable(): Observable<ViewListOfSpeakers> | null {
        return this._losObservable;
    }

    public readonly permission = Permission;

    public hasInitialized = true;

    public get canSee(): boolean {
        return this.operator.hasPerms(Permission.listOfSpeakersCanSee);
    }

    private _losObservable: Observable<ViewListOfSpeakers | null> | null = of(null);
    private _losSub: Subscription | null = null;

    public constructor(
        private cd: ChangeDetectorRef,
        private operator: OperatorService
    ) {}

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
        if (model?.list_of_speakers$) {
            this._losObservable = model.list_of_speakers$;
        } else {
            this._losObservable = of(model?.list_of_speakers);
        }
    }
}
