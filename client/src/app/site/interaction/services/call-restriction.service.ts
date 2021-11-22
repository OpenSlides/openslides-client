import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { UserListIndexType } from 'app/site/agenda/models/view-list-of-speakers';
import { CurrentListOfSpeakersService } from 'app/site/projector/services/current-list-of-speakers.service';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

export const RTC_LOGGED_STORAGE_KEY = `rtcIsLoggedIn`;
@Injectable({
    providedIn: `root`
})
export class CallRestrictionService {
    public isAccessRestricted: Observable<boolean> = this.settingService.get(`conference_los_restriction`);
    public isJitsiActiveInAnotherTab: Observable<boolean> = this.storageMap
        .watch(RTC_LOGGED_STORAGE_KEY, { type: `boolean` })
        .pipe(distinctUntilChanged());
    private userClosPosition = this.closService.currentListOfSpeakersObservable.pipe(
        map(los => los?.findUserIndexOnList(this.operator.operatorId) ?? -1),
        distinctUntilChanged()
    );
    private amountNextSpeakerAutoConnect: Observable<number> = this.settingService.get(
        `conference_auto_connect_next_speakers`
    );

    private hasToEnterCallSubject = new Subject<void>();
    public hasToEnterCallObservable = this.hasToEnterCallSubject.asObservable();

    private hasToLeaveCallSubject = new Subject<void>();
    public hasToLeaveCallObservable = this.hasToLeaveCallSubject.asObservable();

    private canEnterCallSubject = new BehaviorSubject<boolean>(false);
    public canEnterCallObservable = this.canEnterCallSubject.asObservable();

    public constructor(
        private settingService: MeetingSettingsService,
        private operator: OperatorService,
        private closService: CurrentListOfSpeakersService,
        private storageMap: StorageMap
    ) {
        combineLatest([
            this.isAccessRestricted,
            this.userClosPosition,
            this.amountNextSpeakerAutoConnect,
            this.isJitsiActiveInAnotherTab,
            operator.userObservable
        ])
            .pipe(
                distinctUntilChanged(
                    (
                        [prevRestriction, prevClosPos, prevNextSpeakerAuto],
                        [currRestiction, currClosPos, currNextSpeakerAuto]
                    ) => {
                        return (
                            prevRestriction === currRestiction &&
                            prevClosPos === currClosPos &&
                            prevNextSpeakerAuto === currNextSpeakerAuto
                        );
                    }
                )
            )
            .subscribe(([restricted, userClosPos, autoConnectorsAmount, openInotherTab]) => {
                const canManageSpeaker = this.operator.hasPerms(Permission.listOfSpeakersCanManage);
                const isOnClos = userClosPos !== UserListIndexType.NotOnList;

                this.canEnterCallSubject.next(!restricted || canManageSpeaker || isOnClos);

                if (!openInotherTab && isOnClos) {
                    if (
                        autoConnectorsAmount &&
                        autoConnectorsAmount > 0 &&
                        userClosPos > UserListIndexType.Active &&
                        userClosPos <= autoConnectorsAmount
                    ) {
                        this.hasToEnterCallSubject.next();
                    }
                } else if (!isOnClos && restricted && !canManageSpeaker) {
                    this.hasToLeaveCallSubject.next();
                }
            });
    }
}
