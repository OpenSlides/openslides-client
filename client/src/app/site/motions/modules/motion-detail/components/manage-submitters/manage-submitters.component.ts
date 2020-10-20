import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { BehaviorSubject, Observable } from 'rxjs';

import { Id } from 'app/core/definitions/key-types';
import { MotionSubmitterRepositoryService } from 'app/core/repositories/motions/motion-submitter-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionSubmitter } from 'app/site/motions/models/view-motion-submitter';
import { PermissionsService } from 'app/site/motions/services/permissions.service';
import { ViewUser } from 'app/site/users/models/view-user';

/**
 * Component for the motion comments view
 */
@Component({
    selector: 'os-manage-submitters',
    templateUrl: './manage-submitters.component.html',
    styleUrls: ['./manage-submitters.component.scss']
})
export class ManageSubmittersComponent extends BaseComponent {
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
    public users: BehaviorSubject<ViewUser[]>;

    /**
     * The form to add new submitters
     */
    public addSubmitterForm: FormGroup;

    /**
     * The current list of submitters.
     */
    public readonly editSubmitterSubject: BehaviorSubject<ViewMotionSubmitter[]> = new BehaviorSubject([]);

    /**
     * The observable from editSubmitterSubject. Fixing this value is a performance boost, because
     * it is just set one time at loading instead of calling .asObservable() every time.
     */
    public editSubmitterObservable: Observable<ViewMotionSubmitter[]>;

    /**
     * Saves, if the users edits the note.
     */
    public isEditMode = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private userRepository: UserRepositoryService,
        private motionSubmitterRepository: MotionSubmitterRepositoryService,
        public perms: PermissionsService
    ) {
        super(componentServiceCollector);

        this.addSubmitterForm = new FormGroup({ userId: new FormControl([]) });
        this.editSubmitterObservable = this.editSubmitterSubject.asObservable();

        // detect changes in the form
        this.addSubmitterForm.valueChanges.subscribe(formResult => {
            if (formResult && formResult.userId) {
                this.addUserAsSubmitter(formResult.userId);
            }
        });
    }

    /**
     * Enter the edit mode and reset the form and the submitters.
     */
    public onEdit(): void {
        this.isEditMode = true;
        this.editSubmitterSubject.next(this.motion.submitters);
        this.addSubmitterForm.reset();

        // get all users for the submitter add form
        this.users = this.userRepository.getViewModelListBehaviorSubject();
    }

    /**
     * Close the edit view.
     */
    public onClose(): void {
        this.isEditMode = false;
    }

    public async createNewSubmitter(username: string): Promise<void> {
        const newUserObj = await this.userRepository.createFromString(username);
        await this.addUserAsSubmitter(newUserObj.id);
    }

    /**
     * Adds the user to the submitters, if he isn't already in there.
     *
     * @param user The user to add
     */
    public async addUserAsSubmitter(userId: Id): Promise<void> {
        throw new Error('TODO: selector does not work + wait for user repo');
        /* await this.motionSubmitterRepository.create(userId, this.motion);
        this.addSubmitterForm.reset(); */
    }

    /**
     * A sort event occures. Saves the new order into the editSubmitterSubject.
     *
     * @param submitters The new, sorted submitters.
     */
    public onSortingChange(submitters: ViewMotionSubmitter[]): void {
        this.motionSubmitterRepository.sort(submitters, this.motion);
    }

    /**
     * Removes the user from the list of submitters.
     *
     * @param user The user to remove as a submitters
     */
    public onRemove(submitter: ViewMotionSubmitter): void {
        this.motionSubmitterRepository.delete(submitter.id);
    }
}
