import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, Observable, Subject } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ApplauseType } from 'src/app/domain/models/meetings/applause';
import { BaseICCGatewayService } from 'src/app/gateways/base-icc-gateway.service';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { InteractionServiceModule } from './interaction-service.module';

export interface Applause {
    level: number;
    present_users: number;
}

@Injectable({
    providedIn: InteractionServiceModule
})
export class ApplauseService extends BaseICCGatewayService<Applause> {
    public get showParticles(): Observable<boolean> {
        return this.applauseTypeObservable.pipe(map(type => type === ApplauseType.particles));
    }

    public get showBar(): Observable<boolean> {
        return this.applauseTypeObservable.pipe(map(type => type === ApplauseType.bar));
    }

    public get showApplauseLevelObservable(): Observable<boolean> {
        return combineLatest([this.showApplauseLevelConfigObservable, this.applauseLevelObservable]).pipe(
            map(([enabled, amount]) => enabled && amount > 0)
        );
    }

    protected readonly serviceDescription = `ApplauseService`;

    protected readonly receivePath = `/applause`;
    protected get sendPath(): string {
        return `${this.receivePath}/send?meeting_id=${this.activeMeetingId}`;
    }

    private applauseMessageSubject = new BehaviorSubject<Applause>({ level: 0, present_users: 1 });

    private minApplauseLevel!: number;
    private maxApplauseLevel!: number;
    private presentApplauseUsers!: number;
    private applauseTypeObservable: Observable<ApplauseType>;

    public applauseTimeoutObservable: Observable<number>;
    private applauseTimeout = 0;

    private sendsApplauseSubject: Subject<boolean> = new Subject<boolean>();
    public sendsApplauseObservable: Observable<boolean> = this.sendsApplauseSubject as Observable<boolean>;

    public showApplauseObservable: Observable<boolean>;
    private showApplauseLevelConfigObservable: Observable<boolean>;
    private applauseLevelSubject: Subject<number> = new Subject<number>();
    public applauseLevelObservable: Observable<number> = this.applauseLevelSubject as Observable<number>;

    private get maxApplause(): number {
        return this.maxApplauseLevel || this.presentApplauseUsers || 0;
    }

    private get activeMeetingId(): Id {
        return this.activeMeetingService.meetingId!;
    }

    public constructor(settingService: MeetingSettingsService, private activeMeetingService: ActiveMeetingService) {
        super();
        this.setupConnections();

        this.showApplauseObservable = settingService.get(`applause_enable`);
        this.applauseTypeObservable = settingService.get(`applause_type`);
        this.showApplauseLevelConfigObservable = settingService.get(`applause_show_level`);

        this.applauseTimeoutObservable = settingService.get(`applause_timeout`).pipe(map(timeout => timeout * 1000));

        this.applauseTimeoutObservable.subscribe(timeout => {
            this.applauseTimeout = timeout;
        });

        settingService.get(`applause_min_amount`).subscribe(minLevel => {
            this.minApplauseLevel = minLevel;
        });
        settingService.get(`applause_max_amount`).subscribe(maxLevel => {
            this.maxApplauseLevel = maxLevel;
        });

        this.applauseMessageSubject
            .pipe(
                /**
                 * only updates when the effective applause level changes
                 */
                distinctUntilChanged((prev, curr) => prev.level === curr.level),
                filter(curr => curr.level === 0 || curr.level >= this.minApplauseLevel)
            )
            .subscribe(applause => {
                this.presentApplauseUsers = applause.present_users;
                this.applauseLevelSubject.next(applause.level);
            });
    }

    protected onMessage(message: Applause): void {
        console.log(`Applause: `, message);
        this.applauseMessageSubject.next(message);
    }

    public async sendApplause(): Promise<void> {
        await this.send();

        this.sendsApplauseSubject.next(true);
        setTimeout(() => {
            this.sendsApplauseSubject.next(false);
        }, this.applauseTimeout);
    }

    public getApplauseQuote(applauseLevel: number): number {
        if (!applauseLevel) {
            return 0;
        }
        const quote = applauseLevel / (this.maxApplause ?? this.presentApplauseUsers) || 0;
        return quote > 1 ? 1 : quote;
    }
}
