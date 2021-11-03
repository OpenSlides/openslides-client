import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    OnDestroy,
    Output
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';
import { Observable } from 'rxjs';

import { ApplauseService } from '../../services/applause.service';
import { StreamService } from '../../services/stream.service';

@Component({
    selector: `os-stream`,
    templateUrl: `./stream.component.html`,
    styleUrls: [`./stream.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamComponent extends BaseComponent implements AfterViewInit, OnDestroy {
    private streamRunning = false;

    public liveStreamUrl: string;
    private streamLoadedOnce: boolean;

    public get showParticles(): Observable<boolean> {
        return this.applauseService.showParticles;
    }

    public get showVideoPlayer(): boolean {
        return this.streamRunning || this.streamLoadedOnce === false;
    }

    public get isStreamInOtherTab(): boolean {
        return !this.streamRunning && this.streamLoadedOnce;
    }

    @Output()
    public streamTitle: EventEmitter<string> = new EventEmitter();

    @Output()
    public streamSubtitle: EventEmitter<string> = new EventEmitter();

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private streamService: StreamService,
        private applauseService: ApplauseService,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, translate);

        this.subscriptions.push(
            this.streamService.liveStreamUrlObservable.subscribe(url => {
                this.liveStreamUrl = url?.trim();
                this.cd.markForCheck();
            }),
            this.streamService.streamLoadedOnceObservable.subscribe(loadedOnce => {
                this.streamLoadedOnce = loadedOnce || false;
                this.cd.markForCheck();
            }),
            this.streamService.isStreamRunningObservable.subscribe(running => {
                this.streamRunning = running || false;
                this.cd.markForCheck();
            })
        );
    }

    public ngAfterViewInit(): void {
        this.streamTitle.next(`Livestream`);
        this.streamSubtitle.next(``);
        this.cd.detectChanges();
    }

    // closing the tab should also try to stop jitsi.
    // this will usually not be caught by ngOnDestroy
    @HostListener(`window:beforeunload`, [`$event`])
    public async beforeunload($event: any): Promise<void> {
        this.beforeViewCloses();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.beforeViewCloses();
    }

    private beforeViewCloses(): void {
        if (this.streamLoadedOnce && this.streamRunning) {
            this.streamService.deleteStreamingLock();
        }
    }

    public forceLoadStream(): void {
        this.streamService.deleteStreamingLock();
    }

    public onSteamLoaded(): void {
        /**
         * explicit false check, undefined would mean that this was not checked yet
         */
        if (this.streamLoadedOnce === false) {
            this.streamService.setStreamingLock();
            this.streamService.setStreamRunning(true);
        }
    }
}
