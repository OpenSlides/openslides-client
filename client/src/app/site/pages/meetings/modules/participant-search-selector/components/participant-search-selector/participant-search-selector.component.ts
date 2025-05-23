import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { ParticipantListSortService } from '../../../../pages/participants/pages/participant-list/services/participant-list-sort/participant-list-sort.service';
import {
    getParticipantMinimalSubscriptionConfig,
    PARTICIPANT_LIST_SUBSCRIPTION_MINIMAL
} from '../../../../pages/participants/participants.subscription';
import { ParticipantControllerService } from '../../../../pages/participants/services/common/participant-controller.service';
import { ActiveMeetingService } from '../../../../services/active-meeting.service';
import { ViewUser } from '../../../../view-models/view-user';
import { UserSelectionData } from '../..';

@Component({
    selector: `os-participant-search-selector`,
    templateUrl: `./participant-search-selector.component.html`,
    styleUrls: [`./participant-search-selector.component.scss`],
    standalone: false
})
export class ParticipantSearchSelectorComponent extends BaseUiComponent implements OnInit, OnDestroy {
    private _filteredUsersSubject = new BehaviorSubject<ViewUser[]>([]);
    private _nonSelectableUserIds: number[] = [];

    /**
     * Subsciption of the participant list
     */
    private _participantSubscription: string;

    /**
     * Array that holds all participants of the current meeting.
     */
    private _users: ViewUser[] = [];

    /**
     * To check permissions in the template
     */
    public readonly permission = Permission;

    /**
     * Array that holds all users, that should not be selectable.
     */
    @Input()
    public set nonSelectableUserIds(userIds: number[]) {
        this._nonSelectableUserIds = userIds;
        this.filterUsers();
    }

    /**
     * Placeholder string for the search field. Is automatically translated.
     */
    @Input()
    public placeholder = this.translate.instant(`Select participant`);

    /**
     * Event that communicates the selected user to the parent component upon selection
     */
    @Output()
    public userSelected = new EventEmitter<UserSelectionData>();

    @Input()
    public shouldReset = true;

    /**
     * Subject that holds the currently selectable users.
     */
    public get filteredUsersSubject(): BehaviorSubject<ViewUser[]> {
        return this._filteredUsersSubject;
    }

    public usersForm: UntypedFormGroup;

    public constructor(
        private userRepo: ParticipantControllerService,
        private userSortService: ParticipantListSortService,
        private modelRequestService: ModelRequestService,
        private activeMeeting: ActiveMeetingService,
        formBuilder: UntypedFormBuilder,
        private snackBar: MatSnackBar,
        private translate: TranslateService
    ) {
        super();

        this.usersForm = formBuilder.group({
            userId: null
        });
    }

    public ngOnInit(): void {
        this.userSortService.initSorting();
        this.subscriptions.push(
            // observe changes to the form
            this.usersForm.valueChanges.subscribe(async formResult => {
                // resetting a form triggers a form.next(null) - check if user_id
                if (formResult?.userId && typeof formResult?.userId === `number`) {
                    await this.processSelectedUser(formResult.userId);
                    if (this.shouldReset) {
                        this.usersForm.reset();
                    }
                }
            }),
            // The list should be updated when the participants have been edited
            this.userRepo
                .getSortedViewModelListObservable(this.userSortService.repositorySortingKey)
                .subscribe(users => {
                    this._users = users;
                    this.filterUsers();
                })
        );

        this._participantSubscription = PARTICIPANT_LIST_SUBSCRIPTION_MINIMAL + `_${Date.now()}`;
        this.modelRequestService.subscribeTo({
            ...getParticipantMinimalSubscriptionConfig(this.activeMeeting.meetingId),
            subscriptionName: this._participantSubscription
        });
    }

    public override ngOnDestroy(): void {
        this.userSortService.exitSortService();
        if (this._participantSubscription) {
            this.modelRequestService.closeSubscription(this._participantSubscription);
        }

        super.ngOnDestroy();
    }

    /**
     * This function ensures that a selected user is quickly removed from the selection list
     */
    private removeUserFromSelectorList(userId: number): void {
        this._filteredUsersSubject.next(
            this._filteredUsersSubject.value.filter(user => {
                return user.id !== userId;
            })
        );
    }

    /**
     * Sets the current value of the filteredUsersSubject to an Array that holds exactly every single user,
     * who should be available for selection (i.e. who is not included in nonSelectableUsersSubject.value)
     */
    private filterUsers(): void {
        const notAvailable = this._nonSelectableUserIds;
        const availableUsers = this._users.filter(user => !notAvailable.includes(user.id));
        this._filteredUsersSubject.next(availableUsers);
    }

    private processSelectedUser(userId: number): void {
        if (this._filteredUsersSubject.value.some(user => user.id === userId)) {
            if (this.shouldReset) {
                this.removeUserFromSelectorList(userId);
            }
            this.emitSelectedUser({ userId: userId });
        } else {
            throw new Error(`Tried to select an unselectable user`);
        }
    }

    public async createNewSelectedUser(name: string): Promise<void> {
        const newUserObj = await this.userRepo.createFromString(name);
        this.emitSelectedUser({ userId: newUserObj.id, user: newUserObj });
        const user = await firstValueFrom(
            this.userRepo.getViewModelObservable(newUserObj.id).pipe(filter(user => !!user))
        );
        this.snackBar.open(
            this.translate
                .instant(`A user with the username '%username%' and the first name '%first_name%' was created.`)
                .replace(`%username%`, user.username)
                .replace(`%first_name%`, user.first_name),
            this.translate.instant(`Ok`)
        );
    }

    private emitSelectedUser(data: UserSelectionData): void {
        this.userSelected.emit(data);
    }
}
