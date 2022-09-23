import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { distinctUntilChanged, map, Observable, Subject } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { OperatorService } from 'src/app/site/services/operator.service';

import { MeetingSettingsService } from '../../../services/meeting-settings.service';
import { InteractionServiceModule } from './interaction-service.module';

const STREAM_RUNNING_STORAGE_KEY = `streamIsRunning`;

@Injectable({
    providedIn: InteractionServiceModule
})
export class StreamService {
    public liveStreamUrlObservable: Observable<string> = this.settingService.get(`conference_stream_url`);
    public hasLiveStreamUrlObservable: Observable<boolean> = this.liveStreamUrlObservable.pipe(
        map(url => !!url?.trim() || false)
    );

    /**
     * undefined is controlled behavior, meaning, this property was not
     * checked yet.
     * Thus, false-checks have to be explicit
     */
    public streamLoadedOnceObservable: Observable<boolean>;

    private isStreamRunningSubject = new Subject<boolean>();
    public isStreamRunningObservable = this.isStreamRunningSubject.asObservable();

    private canSeeLiveStreamSubject = new Subject<boolean>();
    public canSeeLiveStreamObservable = this.canSeeLiveStreamSubject.asObservable();

    public constructor(
        private storageMap: StorageMap,
        operator: OperatorService,
        private settingService: MeetingSettingsService
    ) {
        this.streamLoadedOnceObservable = this.storageMap
            .watch(STREAM_RUNNING_STORAGE_KEY, { type: `boolean` })
            .pipe(distinctUntilChanged() as any);

        operator.permissionsObservable.subscribe(() => {
            this.canSeeLiveStreamSubject.next(operator.hasPerms(Permission.meetingCanSeeLivestream));
        });
    }

    public setStreamingLock(): void {
        this.storageMap.set(STREAM_RUNNING_STORAGE_KEY, true).subscribe(() => {});
    }

    public setStreamRunning(running: boolean): void {
        this.isStreamRunningSubject.next(running);
    }

    public deleteStreamingLock(): void {
        /**
         * subscriptions are faster than promises. This will fire more reliable
         * than converting it to promise first
         */
        this.storageMap.delete(STREAM_RUNNING_STORAGE_KEY).subscribe();
    }
}
