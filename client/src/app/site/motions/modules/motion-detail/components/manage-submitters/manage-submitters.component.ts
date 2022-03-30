import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'app/core/definitions/key-types';
import { MotionSubmitterRepositoryService } from 'app/core/repositories/motions/motion-submitter-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionSubmitter } from 'app/site/motions/models/view-motion-submitter';
import { PermissionsService } from 'app/site/motions/services/permissions.service';
import { ViewUser } from 'app/site/users/models/view-user';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Selectable } from '../../../../../../shared/components/selectable';

type Submitter = Selectable & { user_id?: Id };

interface IdMap {
    [user_id: number]: number;
}

/**
 * Component for the motion comments view
 */
@Component({
    selector: `os-manage-submitters`,
    templateUrl: `./manage-submitters.component.html`,
    styleUrls: [`./manage-submitters.component.scss`]
})
export class ManageSubmittersComponent extends BaseComponent implements OnInit {
    /**
     * The motion, which the personal note belong to.
     */
    @Input()
    public set motion(value: ViewMotion) {
        this._motion = value;
        this.editSubmitterSubject.next(value.submitters);
    }
    public get motion(): ViewMotion {
        return this._motion;
    }
    private _motion: ViewMotion;

    /**
     * Keep all users to display them.
     */
    public get usersObservable(): Observable<ViewUser[]> {
        const submitters = this.editSubmitterSubject.value.map(submitter => submitter.user_id ?? submitter.id);
        return this._users.pipe(map(users => users.filter(user => !submitters.includes(user.id))));
    }

    /**
     * The form to add new submitters
     */
    public addSubmitterForm: FormControl;

    /**
     * The current list of submitters.
     */
    public readonly editSubmitterSubject: BehaviorSubject<Submitter[]> = new BehaviorSubject([]);

    /**
     * The observable from editSubmitterSubject. Fixing this value is a performance boost, because
     * it is just set one time at loading instead of calling .asObservable() every time.
     */
    public editSubmitterObservable: Observable<Selectable[]>;

    /**
     * Saves, if the users edits the note.
     */
    // public isEditMode = false;
    public set isEditMode(value: boolean) {
        this._editMode = value;
        this._addSubmittersSet.clear();
        this._removeSubmittersMap = {};
    }

    public get isEditMode(): boolean {
        return this._editMode;
    }

    private _users: Observable<ViewUser[]>;
    private _editMode = false;

    private _addSubmittersSet = new Set<Id>();
    private _removeSubmittersMap: IdMap = {};

    private _oldSubmitters: Set<Id>;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private userRepository: UserRepositoryService,
        private motionSubmitterRepository: MotionSubmitterRepositoryService,
        public perms: PermissionsService
    ) {
        super(componentServiceCollector, translate);

        this.addSubmitterForm = new FormControl([]);
        this.editSubmitterObservable = this.editSubmitterSubject.asObservable();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.addSubmitterForm.valueChanges.subscribe(nextValue => {
                if (nextValue) {
                    this.addUserAsSubmitter(this.userRepository.getViewModel(nextValue));
                }
            })
        );
    }

    /**
     * Save the submitters
     */
    public async onSave(): Promise<void> {
        if (Object.values(this._removeSubmittersMap).length > 0) {
            await this.motionSubmitterRepository.delete(...Object.values(this._removeSubmittersMap));
        }
        if (this._addSubmittersSet.size > 0) {
            await this.motionSubmitterRepository.create(this.motion, ...this._addSubmittersSet);
        }
        this.isEditMode = false;
    }

    /**
     * Close the edit view.
     */
    public onCancel(): void {
        this.isEditMode = false;
    }

    /**
     * Enter the edit mode and reset the form and the submitters.
     */
    public onEdit(): void {
        this.isEditMode = true;
        this.editSubmitterSubject.next(this.motion.submitters);
        this._oldSubmitters = new Set(this.motion.submitters.map(submitter => submitter.user_id));
        this.resetForm();

        // get all users for the submitter add form
        this._users = this.userRepository.getViewModelListObservable();
    }

    public async createNewSubmitter(username: string): Promise<void> {
        const newUserObj = await this.userRepository.createFromString(username);
        await this.addUserAsSubmitter(newUserObj);
    }

    /**
     * A sort event occures. Saves the new order into the editSubmitterSubject.
     *
     * @param submitters The new, sorted submitters.
     */
    public onSortingChange(submitters: ViewMotionSubmitter[]): void {
        this.editSubmitterSubject.next(submitters);
        this.motionSubmitterRepository.sort(submitters, this.motion);
    }

    /**
     * Removes the user from the list of submitters.
     *
     * @param user The user to remove as a submitters
     */
    public onRemove(submitter: Submitter): void {
        if (submitter.user_id) {
            this._removeSubmittersMap[submitter.user_id] = submitter.id;
        } else if (this._addSubmittersSet.has(submitter.id)) {
            this._addSubmittersSet.delete(submitter.id);
        }
        const submitters = this.editSubmitterSubject.getValue();
        this.editSubmitterSubject.next(submitters.filter(user => user.id !== submitter.id));
    }

    /**
     * Adds the user to the submitters, if he isn't already in there.
     */
    private async addUserAsSubmitter(submitter: Submitter): Promise<void> {
        if (!submitter?.user_id) {
            if (this._oldSubmitters.has(submitter.id)) {
                delete this._removeSubmittersMap[submitter.id];
            } else {
                this._addSubmittersSet.add(submitter.id);
            }
        }
        const submitters = this.editSubmitterSubject.value;
        this.editSubmitterSubject.next(submitters.concat(submitter));
        this.resetForm();
    }

    private resetForm(): void {
        this.addSubmitterForm.reset();
    }
}
