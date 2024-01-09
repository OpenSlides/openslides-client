import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, Observable } from 'rxjs';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';

import { ApplauseService } from '../../../../services/applause.service';
import { InteractionService } from '../../../../services/interaction.service';
import { RtcService } from '../../../../services/rtc.service';
import { StreamService } from '../../../../services/stream.service';

@Component({
    selector: `os-interaction-container`,
    templateUrl: `./interaction-container.component.html`,
    styleUrls: [`./interaction-container.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InteractionContainerComponent extends BaseMeetingComponent implements OnInit {
    public get isClosed(): boolean {
        return !this._isOpen;
    }

    public get isApplausEnabled(): Observable<boolean> {
        return this.applauseService.showApplauseObservable;
    }

    public get showApplauseBar(): Observable<boolean> {
        return this.applauseService.showBar;
    }

    public get isConfStateStream(): Observable<boolean> {
        return this.interactionService.isConfStateStream;
    }

    public get isConfStateJitsi(): Observable<boolean> {
        return this.interactionService.isConfStateJitsi;
    }

    public get isConfStateNone(): Observable<boolean> {
        return this.interactionService.isConfStateNone;
    }

    public get isStreamInOtherTab(): boolean {
        return !this._streamRunning && this._streamLoadedOnce;
    }

    public containerHeadTitle = ``;
    public containerHeadSubtitle = ``;

    private _isOpen = false;

    private _streamRunning = false;
    private _streamLoadedOnce = false;

    public constructor(
        protected override translate: TranslateService,
        rtcService: RtcService,
        streamService: StreamService,
        private interactionService: InteractionService,
        private applauseService: ApplauseService,
        private cd: ChangeDetectorRef
    ) {
        super();
        this.subscriptions.push(
            rtcService.showCallDialogObservable.subscribe(show => {
                if (show) {
                    this.closeBody();
                }
                this.cd.markForCheck();
            }),
            streamService.streamLoadedOnceObservable.subscribe(loadedOnce => {
                this._streamLoadedOnce = loadedOnce;
                if (!this.isStreamInOtherTab) {
                    this.openBody();
                }
                this.cd.markForCheck();
            }),
            streamService.isStreamRunningObservable.subscribe(running => {
                this._streamRunning = running || false;
                if (!this.isStreamInOtherTab) {
                    this.openBody();
                }
                this.cd.markForCheck();
            })
        );
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.interactionService.conferenceStateObservable.pipe(distinctUntilChanged()).subscribe(state => {
                if (state) {
                    this.clearTitles();
                }
            })
        );
    }

    private clearTitles(): void {
        this.containerHeadTitle = ``;
        this.containerHeadSubtitle = ``;
        this.cd.markForCheck();
        this.cd.detectChanges();
    }

    public toggleBodyState(): void {
        if (this.isClosed) {
            this.openBody();
        } else {
            this.closeBody();
        }
    }

    public updateTitle(title: string): void {
        if (title !== this.containerHeadTitle) {
            this.containerHeadTitle = title ?? ``;
            this.cd.markForCheck();
        }
    }

    public updateSubtitle(title: string): void {
        if (title !== this.containerHeadSubtitle) {
            this.containerHeadSubtitle = title ?? ``;
            this.cd.markForCheck();
        }
    }

    private openBody(): void {
        this._isOpen = true;
    }

    private closeBody(): void {
        this._isOpen = false;
    }
}
