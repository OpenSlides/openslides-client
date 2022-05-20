import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { UserSelectionData } from '../..';
import { ParticipantControllerService } from '../../../../pages/participants/services/common/participant-controller.service';
import { ViewUser } from '../../../../view-models/view-user';

@Component({
    selector: 'os-participant-search-selector',
    templateUrl: './participant-search-selector.component.html',
    styleUrls: ['./participant-search-selector.component.scss']
})
export class ParticipantSearchSelectorComponent extends BaseUiComponent implements OnInit {
    /**
     * To check permissions in the template
     */
    public readonly permission = Permission;

    private _filteredUsersSubject = new BehaviorSubject<ViewUser[]>([]);

    /**
     * Subject that holds all users, that should not be selectable.
     * Needs to be ubdated by parent component.
     */
    @Input()
    public nonSelectableUsersSubject! : BehaviorSubject<number[]>;

    /**
     * Placeholder string for the search field. Is automatically translated.
     */
    @Input()
    public placeholder: string = `Select a user...`;

    /**
     * Event that communicates the selected user to the parent component upon selection
     */
    @Output()
    public userSelected = new EventEmitter<UserSelectionData>();

    /**
     * Subject that holds the currently selectable users.
     */
    public get filteredUsersSubject(): BehaviorSubject<ViewUser[]> {
        return this._filteredUsersSubject;
    }

    /**
     * Array that holds all participants of the current meeting.
     */
    private users: ViewUser[] = [];

    public usersForm: FormGroup;

    public constructor(
        private userRepo: ParticipantControllerService,
        formBuilder: FormBuilder
    ) {
        super();

        this.usersForm = formBuilder.group({
            userId: null
        });
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            // ovserve changes to the form
            this.usersForm.valueChanges.subscribe(async formResult => {
                // resetting a form triggers a form.next(null) - check if user_id
                if (formResult?.userId && typeof formResult?.userId === `number`) {
                    await this.processSelectedUser(formResult.userId);
                    this.usersForm.reset();
                }
            }),
            //The list should be updated when the participants have been edited...
            this.userRepo.getViewModelListObservable().subscribe(users => {
                this.users = users;
                this.filterUsers();
            }),
            //...or if the users that should not be selectable have changed.
            this.nonSelectableUsersSubject.subscribe(userIds => this.filterUsers())
        );
    }

    /**
     * This function ensures that a selected user is quickly removed from the selection list
     */
    private removeUserFromSelectorList(userId: number) {
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
    private filterUsers(){
        const notAvailable = this.nonSelectableUsersSubject.value;
        const availableUsers = this.users.filter(user => !notAvailable.includes(user.id));
        this._filteredUsersSubject.next(availableUsers);
    }

    private processSelectedUser(userId: number): void {
        if (this._filteredUsersSubject.value.some(user => user.id === userId)) {
            this.removeUserFromSelectorList(userId);
            this.emitSelectedUser({ userId: userId });
        } else {
            throw new Error(`Tried to select an unselectable user`);
        }
    }

    public async createNewSelectedUser(username: string): Promise<void> {
        const newUserObj = await this.userRepo.createFromString(username);
        this.emitSelectedUser({ userId: newUserObj.id, user: newUserObj });
    }

    private emitSelectedUser(data: UserSelectionData): void {
        this.userSelected.emit(data);
    }
}
