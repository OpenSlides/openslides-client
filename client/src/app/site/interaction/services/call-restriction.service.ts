import { Injectable } from '@angular/core';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { UserListIndexType } from 'app/site/agenda/models/view-list-of-speakers';
import { CurrentListOfSpeakersService } from 'app/site/projector/services/current-list-of-speakers.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Injectable({
    providedIn: `root`
})
export class CallRestrictionService {
    private canManageSpeaker: boolean;
    private restricted: boolean;
    private isOnCurrentLos: boolean;
    private nextSpeakerAmount: number;

    public isAccessRestricted: Observable<boolean>;

    private canEnterCallSubject = new BehaviorSubject<boolean>(false);
    public canEnterCallObservable = this.canEnterCallSubject.asObservable();

    private hasToEnterCallSubject = new Subject<void>();
    public hasToEnterCallObservable = this.hasToEnterCallSubject.asObservable();

    private hasToLeaveCallSubject = new Subject<void>();
    public hasToLeaveCallObservable = this.hasToLeaveCallSubject.asObservable();

    public constructor(
        settingService: MeetingSettingsService,
        operator: OperatorService,
        closService: CurrentListOfSpeakersService
    ) {
        /**
         * general access perm
         */
        operator.userObservable.subscribe(() => {
            this.canManageSpeaker = operator.hasPerms(Permission.listOfSpeakersCanManage);
            this.updateCanEnterCall();
        });

        /**
         * LosRestriction
         */
        this.isAccessRestricted = settingService.get(`conference_los_restriction`);
        this.isAccessRestricted.subscribe(restricted => {
            this.restricted = restricted;
            this.updateCanEnterCall();
        });

        /**
         * Is User In Clos
         */
        closService.currentListOfSpeakersObservable
            .pipe(
                map(los => los?.findUserIndexOnList(operator.operatorId) ?? -1),
                distinctUntilChanged()
            )
            .subscribe(userLosIndex => {
                this.isOnCurrentLos = userLosIndex !== UserListIndexType.NotOnList;
                this.updateCanEnterCall();
                this.updateAutoJoinJitsiByLosIndex(userLosIndex);
            });

        /**
         * Amount of next speakers
         */
        settingService.get(`conference_auto_connect_next_speakers`).subscribe(nextSpeakerAmount => {
            this.nextSpeakerAmount = nextSpeakerAmount;
        });
    }

    private updateCanEnterCall(): void {
        this.canEnterCallSubject.next(!this.restricted || this.canManageSpeaker || this.isOnCurrentLos);
    }

    private updateAutoJoinJitsiByLosIndex(operatorClosIndex: number): void {
        if (operatorClosIndex !== UserListIndexType.NotOnList) {
            if (
                this.nextSpeakerAmount &&
                this.nextSpeakerAmount > 0 &&
                operatorClosIndex > UserListIndexType.Active &&
                operatorClosIndex <= this.nextSpeakerAmount
            ) {
                this.hasToEnterCallSubject.next();
            }
        } else if (operatorClosIndex === UserListIndexType.NotOnList && this.restricted && !this.canManageSpeaker) {
            this.hasToLeaveCallSubject.next();
        }
    }
}
