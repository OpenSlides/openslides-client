import { inject, Service } from '@angular/core';
import { Permission } from '@app/domain/definitions/permission';
import { OperatorService } from '@app/site/services/operator.service';
import { StorageMap } from '@ngx-pwa/local-storage';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, Subject } from 'rxjs';

import { MeetingSettingsService } from '../../../services/meeting-settings.service';
import { SpeakerStateOnList } from '../../agenda';
import { CurrentListOfSpeakersService } from '../../agenda/modules/list-of-speakers/services/current-list-of-speakers.service';
import { RTC_LOGGED_STORAGE_KEY } from './rtc.service';

@Service()
export class CallRestrictionService {
    private settingService = inject(MeetingSettingsService);
    private operator = inject(OperatorService);
    private closService = inject(CurrentListOfSpeakersService);
    private storageMap = inject(StorageMap);

    public isAccessRestricted: Observable<boolean> = this.settingService.get(`conference_los_restriction`);
    public isJitsiActiveInAnotherTab: Observable<boolean> = this.storageMap
        .watch(RTC_LOGGED_STORAGE_KEY, { type: `boolean` })
        .pipe(distinctUntilChanged() as any);

    private userClosPosition = this.closService.currentListOfSpeakersObservable.pipe(
        map(los => los?.findUserIndexOnList(this.operator.operatorId!) ?? -1),
        distinctUntilChanged()
    );

    private amountNextSpeakerAutoConnect: Observable<number> = this.settingService.get(
        `conference_auto_connect_next_speakers`
    );

    private hasToEnterCallSubject = new Subject<void>();
    public hasToEnterCallObservable = this.hasToEnterCallSubject as Observable<void>;

    private hasToLeaveCallSubject = new Subject<void>();
    public hasToLeaveCallObservable = this.hasToLeaveCallSubject as Observable<void>;

    private canEnterCallSubject = new BehaviorSubject<boolean>(false);
    public canEnterCallObservable = this.canEnterCallSubject as Observable<boolean>;

    public constructor() {
        combineLatest([
            this.isAccessRestricted,
            this.userClosPosition,
            this.amountNextSpeakerAutoConnect,
            this.operator.userObservable,
            this.isJitsiActiveInAnotherTab
        ])
            .pipe(
                distinctUntilChanged(
                    (
                        [prevRestriction, prevClosPos, prevNextSpeakerAuto, prevUser],
                        [currRestiction, currClosPos, currNextSpeakerAuto, currUser]
                    ) => {
                        return (
                            prevRestriction === currRestiction &&
                            prevClosPos === currClosPos &&
                            prevNextSpeakerAuto === currNextSpeakerAuto &&
                            JSON.stringify(prevUser?.user) === JSON.stringify(currUser?.user)
                        );
                    }
                )
            )
            .subscribe(([restricted, userClosPos, autoConnectorsAmount, currentViewUser, openInotherTab]) => {
                /**
                 * "unmoderated" users come, stay and leave the call as they please
                 * This applies to LOS-Manager and every non natural person
                 */
                const isUnmoderated: boolean =
                    this.operator.hasPerms(Permission.listOfSpeakersCanManage) ||
                    currentViewUser?.user.is_physical_person === false;
                const isOnClos = userClosPos !== SpeakerStateOnList.NotOnList;

                this.canEnterCallSubject.next(!restricted || isUnmoderated || isOnClos);

                if (!openInotherTab && isOnClos) {
                    if (
                        autoConnectorsAmount &&
                        autoConnectorsAmount > 0 &&
                        userClosPos > SpeakerStateOnList.Active &&
                        userClosPos <= autoConnectorsAmount
                    ) {
                        this.hasToEnterCallSubject.next();
                    }
                } else if (!isOnClos && restricted && !isUnmoderated) {
                    this.hasToLeaveCallSubject.next();
                }
            });
    }
}
