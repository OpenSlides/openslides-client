import { Component, Input, OnInit } from '@angular/core';
import { Selectable } from 'src/app/domain/interfaces/selectable';
import { Id, Fqid } from 'src/app/domain/definitions/key-types';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { Observable, map, BehaviorSubject, of } from 'rxjs';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { FormControl } from '@angular/forms';
import { ViewMotionSubmitter } from '../../../../modules/submitters/view-models/view-motion-submitter';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { MotionSubmitterControllerService } from '../../../../modules/submitters/services/motion-submitter-controller.service/motion-submitter-controller.service';
import { MotionPermissionService } from '../../../../services/common/motion-permission.service/motion-permission.service';
import { Action, createEmptyAction } from 'src/app/gateways/actions';
import { Identifiable } from 'src/app/domain/interfaces';

type Submitter = Selectable & { fqid?: Fqid; user_id?: Id };

interface IdMap {
    [user_id: number]: number;
}

@Component({
    selector: 'os-motion-manage-submitters',
    templateUrl: './motion-manage-submitters.component.html',
    styleUrls: ['./motion-manage-submitters.component.scss']
})
export class MotionManageSubmittersComponent extends BaseUiComponent implements OnInit {
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
    private _motion!: ViewMotion;

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
    public readonly editSubmitterSubject = new BehaviorSubject<Submitter[]>([]);

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

    private _users: Observable<ViewUser[]> = of([]);
    private _editMode = false;

    private _addSubmittersSet = new Set<Id>();
    private _removeSubmittersMap: IdMap = {};

    private _oldSubmitters = new Set<Id>([]);

    public constructor(
        private userRepository: ParticipantControllerService,
        private motionSubmitterRepository: MotionSubmitterControllerService,
        public perms: MotionPermissionService
    ) {
        super();

        this.addSubmitterForm = new FormControl([]);
        this.editSubmitterObservable = this.editSubmitterSubject.asObservable();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.addSubmitterForm.valueChanges.subscribe(nextValue => {
                if (nextValue) {
                    this.addUserAsSubmitter(this.userRepository.getViewModel(nextValue)!);
                }
            })
        );
    }

    /**
     * Save the submitters
     */
    public async onSave(): Promise<void> {
        let actions: Action<any>[] = [];
        if (Object.values(this._removeSubmittersMap).length > 0) {
            const removeSubmittersMap = Object.values(this._removeSubmittersMap).map(id => {
                return { id: id };
            }) as Identifiable[];
            actions.push(this.motionSubmitterRepository.delete(...removeSubmittersMap));
        }
        if (this._addSubmittersSet.size > 0) {
            actions.push(
                this.motionSubmitterRepository.create(
                    this.motion,
                    ...Array.from(this._addSubmittersSet).map(id => ({ id }))
                )
            );
        }
        await Action.from(...actions).resolve();
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
    public onSortingChange(submitters: Submitter[]): void {
        this.editSubmitterSubject.next(submitters);
        this.motionSubmitterRepository.sort(submitters, this.motion);
    }

    /**
     * Removes the user from the list of submitters.
     *
     * @param submitter The user to remove as a submitters
     */
    public onRemove(submitter: Submitter): void {
        if (submitter.user_id) {
            this._removeSubmittersMap[submitter.user_id] = submitter.id;
        } else if (this._addSubmittersSet.has(submitter.id)) {
            this._addSubmittersSet.delete(submitter.id);
        }
        const submitters = this.editSubmitterSubject.getValue();
        this.editSubmitterSubject.next(submitters.filter(user => user.fqid !== submitter.fqid));
    }

    /**
     * Adds the user to the submitters, if they aren't already in there.
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
