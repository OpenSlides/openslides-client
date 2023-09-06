import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, filter, firstValueFrom, map, Observable } from 'rxjs';
import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Selectable } from 'src/app/domain/interfaces/selectable';
import { Action } from 'src/app/gateways/actions';
import { UserSelectionData } from 'src/app/site/pages/meetings/modules/participant-search-selector';
import { ViewMotion, ViewMotionSubmitter } from 'src/app/site/pages/meetings/pages/motions';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { MotionSubmitterControllerService } from '../../../../modules/submitters/services/motion-submitter-controller.service/motion-submitter-controller.service';
import { MotionControllerService } from '../../../../services/common/motion-controller.service';
import { MotionPermissionService } from '../../../../services/common/motion-permission.service/motion-permission.service';

type Submitter = Selectable & { fqid?: Fqid; user_id?: Id };

interface IdMap {
    [user_id: number]: number;
}

@Component({
    selector: `os-motion-manage-submitters`,
    templateUrl: `./motion-manage-submitters.component.html`,
    styleUrls: [`./motion-manage-submitters.component.scss`]
})
export class MotionManageSubmittersComponent extends BaseUiComponent implements OnInit {
    /**
     * The motion, which the personal note belong to.
     */
    @Input()
    public set motion(value: ViewMotion) {
        this._motion = value;
        this.updateSubmitterData(value.submitters);
    }

    public get motion(): ViewMotion {
        return this._motion;
    }

    /**
     * The current list of submitters.
     */
    public readonly editSubmitterSubject = new BehaviorSubject<Submitter[]>([]);
    public editSubmitterUserIds: number[] = [];

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

    private _editMode = false;

    private _motion!: ViewMotion;

    private _addSubmittersSet = new Set<Id>();
    private _removeSubmittersMap: IdMap = {};

    private _oldSubmitters = new Set<Id>([]);

    public constructor(
        private userRepository: ParticipantControllerService,
        private motionSubmitterRepository: MotionSubmitterControllerService,
        public perms: MotionPermissionService,
        private motionController: MotionControllerService
    ) {
        super();

        this.editSubmitterObservable = this.editSubmitterSubject as Observable<Selectable[]>;
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.editSubmitterSubject.subscribe(
                submitters =>
                    (this.editSubmitterUserIds = submitters.map(submitter => submitter.user_id ?? submitter.id))
            )
        );
    }

    /**
     * Save the submitters
     */
    public async onSave(): Promise<void> {
        const actions: Action<any>[] = [];
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
        const submitters = await Promise.all(
            this.editSubmitterSubject.value.map(async val =>
                val.user_id
                    ? val
                    : await firstValueFrom(
                          this.motionController.getViewModelObservable(this.motion.id).pipe(
                              map(motion => motion.submitters.find(sub => sub.user_id === val.id)),
                              filter(sub => !!sub)
                          )
                      )
            )
        );
        this.motionSubmitterRepository.sort(submitters, this.motion);
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

    public addSubmitter(data: UserSelectionData): void {
        if (data.user) {
            this.addUserAsSubmitter(data.user);
        } else {
            this.addUserAsSubmitter(this.userRepository.getViewModel(data.userId));
        }
    }

    private updateSubmitterData(submitters: ViewMotionSubmitter[]): void {
        if (!this.isEditMode) {
            this.editSubmitterSubject.next(submitters);
            return;
        }
        const newRemoveMap: IdMap = {};
        const sortMap = new Map(
            this.editSubmitterSubject.value.map((submitter, index) => [this.getUserId(submitter), index])
        );
        for (const submitter of submitters) {
            if (this._removeSubmittersMap[submitter.user_id]) {
                newRemoveMap[submitter.user_id] = submitter.id;
            } else if (this._addSubmittersSet.has(submitter.user_id)) {
                this._addSubmittersSet.delete(submitter.user_id);
            }
        }
        this.editSubmitterSubject.next(
            (submitters as Submitter[])
                .concat(
                    this.editSubmitterSubject.value.filter(
                        submitter => submitter.user_id && this._addSubmittersSet.has(submitter.id)
                    )
                )
                .sort((a, b) => {
                    const indexA = sortMap.get(this.getUserId(a));
                    const indexB = sortMap.get(this.getUserId(b));
                    if (indexB === undefined) return -1;
                    if (indexA === undefined) return 1;
                    return indexA - indexB;
                })
        );
        this._removeSubmittersMap = newRemoveMap;
    }

    private getUserId(submitter: Submitter): number {
        return submitter.user_id ?? submitter.id;
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
    }
}
