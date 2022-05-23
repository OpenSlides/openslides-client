import { Injectable } from '@angular/core';
import { combineLatest, distinctUntilChanged, filter, map, Observable, Subject } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ApplauseType } from 'src/app/domain/models/meetings/applause';
import { HttpService } from 'src/app/gateways/http.service';
import { NotifyService } from 'src/app/gateways/notify.service';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { InteractionServiceModule } from './interaction-service.module';

export interface Applause {
    level: number;
    presentUsers: number;
}

const APPLAUSE_SEND_PATH = `/system/icc/applause/send`;
const APPLAUSE_RECEIVE_TOPIC = `applause`; // TODO

@Injectable({
    providedIn: InteractionServiceModule
})
export class ApplauseService {
    private minApplauseLevel!: number;
    private maxApplauseLevel!: number;
    private presentApplauseUsers!: number;
    private applauseTypeObservable: Observable<ApplauseType>;

    public applauseTimeoutObservable: Observable<number>;
    private applauseTimeout = 0;

    private sendsApplauseSubject: Subject<boolean> = new Subject<boolean>();
    public sendsApplauseObservable: Observable<boolean> = this.sendsApplauseSubject.asObservable();

    public showApplauseObservable: Observable<boolean>;
    private showApplauseLevelConfigObservable: Observable<boolean>;
    private applauseLevelSubject: Subject<number> = new Subject<number>();
    public applauseLevelObservable: Observable<number> = this.applauseLevelSubject.asObservable();

    private get maxApplause(): number {
        return this.maxApplauseLevel || this.presentApplauseUsers || 0;
    }

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

    private get activeMeetingId(): Id {
        return this.activeMeetingService.meetingId!;
    }

    public constructor(
        settingService: MeetingSettingsService,
        private httpService: HttpService,
        private notifyService: NotifyService,
        private activeMeetingService: ActiveMeetingService
    ) {
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

        this.notifyService
            .getMessageObservable<Applause>(APPLAUSE_RECEIVE_TOPIC)
            .pipe(
                map(notify => notify.message as Applause),
                /**
                 * only updates when the effective applause level changes
                 */
                distinctUntilChanged((prev, curr) => prev.level === curr.level),
                filter(curr => curr.level === 0 || curr.level >= this.minApplauseLevel)
            )
            .subscribe(applause => {
                this.presentApplauseUsers = applause.presentUsers;
                this.applauseLevelSubject.next(applause.level);
            });
    }

    public async sendApplause(): Promise<void> {
        await this.httpService.post(`${APPLAUSE_SEND_PATH}?meeting_id=${this.activeMeetingId}`);

        this.sendsApplauseSubject.next(true);
        setTimeout(() => {
            this.sendsApplauseSubject.next(false);
        }, this.applauseTimeout);
    }

    public getApplauseQuote(applauseLevel: number): number {
        if (!applauseLevel) {
            return 0;
        }
        const quote = applauseLevel / this.maxApplause || 0;
        return quote > 1 ? 1 : quote;
    }
}
