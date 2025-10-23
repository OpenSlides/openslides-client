import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { BehaviorSubject, filter, firstValueFrom, map, Observable } from 'rxjs';
import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Selectable } from 'src/app/domain/interfaces/selectable';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { Action, ActionService } from 'src/app/gateways/actions';
import { KeyOfType } from 'src/app/infrastructure/utils/keyof-type';
import { BaseHasMeetingUserViewModel } from 'src/app/site/pages/meetings/base/base-has-meeting-user-view-model';
import { UserSelectionData } from 'src/app/site/pages/meetings/modules/participant-search-selector';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { BaseMotionMeetingUserControllerService } from '../../../../../../modules/util';
import { MotionControllerService } from '../../../../../../services/common/motion-controller.service';
import { MotionPermissionService } from '../../../../../../services/common/motion-permission.service/motion-permission.service';

type MotionMeetingUser = Selectable & { fqid?: Fqid; user_id?: Id };

type IdMap = Record<number, number>;

@Component({
    selector: `os-motion-manage-motion-meeting-users`,
    templateUrl: `./motion-manage-motion-meeting-users.component.html`,
    styleUrls: [`./motion-manage-motion-meeting-users.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MotionManageMotionMeetingUsersComponent<V extends BaseHasMeetingUserViewModel<M>, M extends BaseModel>
    extends BaseUiComponent
    implements OnInit
{
    public get motion(): ViewMotion {
        return this._motion;
    }

    @Input()
    public set motion(value: ViewMotion) {
        this._motion = value;
        this.updateData(this.intermediateModels);
    }

    @Input()
    public field: KeyOfType<ViewMotion, V[]>;

    @Input()
    public repo: BaseMotionMeetingUserControllerService<V, M>;

    @Input()
    public title: string;

    @Input()
    public disableEdit: boolean;

    @Input()
    public useAdditionalInput: boolean;

    @Input()
    public additionalInputLabel: string;

    @Input()
    public additionalInputValue: string;

    @Input()
    public additionalInputField: KeyOfType<ViewMotion, string>;

    public additionalInputControl: UntypedFormControl;

    @Input()
    public secondSelectorLabel: string;

    @Input()
    public loadSecondSelectorValues: () => Promise<Selectable[]>;

    public secondSelectorValues: Selectable[] = [];

    public secondSelectorFormControl: UntypedFormControl;

    private secondSelectorDisabledIds: number[] = [];

    public get intermediateModels(): V[] {
        return this.getIntermediateModels(this.motion);
    }

    public get intermediateModels$(): Observable<V[]> {
        return this.motion[this.field + `$`] as unknown as Observable<V[]>;
    }

    /**
     * The current list of intermediate models.
     */
    public readonly editSubject = new BehaviorSubject<MotionMeetingUser[]>([]);
    public nonSelectableUserIds: number[] = [];

    /**
     * The observable from editSubject. Fixing this value is a performance boost, because
     * it is just set one time at loading instead of calling .asObservable() every time.
     */
    public editObservable: Observable<Selectable[]>;

    /**
     * Saves if the users edits the note.
     */
    public set isEditMode(value: boolean) {
        this._editMode = value;
        this._addUsersSet.clear();
        this._removeUsersMap = {};
        if (value && this.loadSecondSelectorValues) {
            this.loadSecondSelectorValues().then(items => {
                this.secondSelectorValues = items;
            });
        }
    }

    public get isEditMode(): boolean {
        return this._editMode;
    }

    private _editMode = false;

    private _motion!: ViewMotion;

    private _addUsersSet = new Set<Id>();
    private _removeUsersMap: IdMap = {};

    private _oldIds = new Set<Id>([]);

    public constructor(
        private userRepository: ParticipantControllerService,
        public perms: MotionPermissionService,
        private motionController: MotionControllerService,
        private actionService: ActionService,
        private fb: UntypedFormBuilder
    ) {
        super();

        this.editObservable = this.editSubject as Observable<Selectable[]>;
    }

    public ngOnInit(): void {
        this.additionalInputControl = this.fb.control(``);
        this.secondSelectorFormControl = this.fb.control(``);
        this.subscriptions.push(
            this.editSubject.subscribe(ids => (this.nonSelectableUserIds = ids.map(model => model.user_id ?? model.id)))
        );
        this.subscriptions.push(
            this.secondSelectorFormControl.valueChanges.subscribe(value => {
                if (value) {
                    this.changeSecondSelector();
                }
            })
        );
    }

    public async onSave(): Promise<void> {
        const actions: Action<any>[] = [];
        if (Object.values(this._removeUsersMap).length > 0) {
            const removeMap = Object.values(this._removeUsersMap).map(id => {
                return { id: id };
            }) as Identifiable[];
            actions.push(this.repo.delete(...removeMap));
        }
        if (this._addUsersSet.size > 0) {
            actions.push(this.repo.create(this.motion, ...Array.from(this._addUsersSet).map(id => ({ id }))));

            if (Object.values(this._removeUsersMap).length > 0) {
                actions[0].setSendActionFn((r, _) => this.actionService.sendRequests(r, true));
            }
        }

        const promise = Promise.all(
            this.editSubject.value.map(val =>
                val.user_id
                    ? val
                    : firstValueFrom(
                          this.motionController.getViewModelObservable(this.motion.id).pipe(
                              map(motion =>
                                  this.getIntermediateModels(motion).find(model => {
                                      if (val instanceof ViewUser) {
                                          return model.user_id === val.id;
                                      }
                                      return model.id === val.id;
                                  })
                              ),
                              filter(model => !!model)
                          )
                      )
            )
        );
        if (this.useAdditionalInput) {
            const value = this.additionalInputControl.value;
            actions.push(this.motionController.update({ [this.additionalInputField]: value }, this.motion));
            this.secondSelectorFormControl.setValue(null);
        }

        await Action.from(...actions).resolve();

        const result = await promise;
        if (result.length > 0) {
            this.repo.sort(result, this.motion).resolve();
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
     * Enter the edit mode and reset the form and the data.
     */
    public onEdit(): void {
        this.isEditMode = true;
        if (this.useAdditionalInput) {
            this.additionalInputControl.setValue(this.additionalInputValue);
        }
        this.editSubject.next(this.intermediateModels);
        this._oldIds = new Set(this.intermediateModels.map(model => model.id));
    }

    public async createNewIntermediateModel(username: string): Promise<void> {
        const newUserObj = await this.userRepository.createFromString(username);
        await this.addUserAsIntermediateModel(newUserObj);
    }

    /**
     * A sort event occures. Saves the new order into the editSubject.
     */
    public onSortingChange(models: MotionMeetingUser[]): void {
        this.editSubject.next(models);
    }

    /**
     * Removes the user from the list.
     */
    public onRemove(model: MotionMeetingUser): void {
        if (model.user_id) {
            this._removeUsersMap[model.id] = model.id;
        } else if (this._addUsersSet.has(model.id)) {
            this._addUsersSet.delete(model.id);
        } else if (model.user_id === undefined) {
            this._removeUsersMap[model.id] = model.id;
        }
        const value = this.editSubject.getValue();
        this.editSubject.next(value.filter(user => user.fqid !== model.fqid));
    }

    public addUser(data: UserSelectionData): void {
        if (data.user) {
            this.addUserAsIntermediateModel(data.user);
        } else {
            this.addUserAsIntermediateModel(this.userRepository.getViewModel(data.userId));
        }
    }

    public getDisabledFn(): (v: Selectable) => boolean {
        return (value: Selectable) => this.secondSelectorDisabledIds.includes(value.id);
    }

    public openedChange(opened: boolean): void {
        if (!opened) {
            this.secondSelectorDisabledIds = [];
        }
    }

    public get isSecondSelectorValuesFilled(): boolean {
        return this.secondSelectorValues && this.secondSelectorValues.length > 0;
    }

    private updateData(models: V[]): void {
        if (!this.isEditMode) {
            this.editSubject.next(models);
            return;
        }
        const newRemoveMap: IdMap = {};
        const sortMap = new Map(this.editSubject.value.map((model, index) => [this.getUserId(model), index]));
        for (const model of models) {
            if (this._removeUsersMap[model.id]) {
                newRemoveMap[model.id] = model?.id;
            } else if (this._addUsersSet.has(model.id)) {
                this._addUsersSet.delete(model.id);
            }
        }
        this.editSubject.next(
            (models as MotionMeetingUser[])
                .concat(this.editSubject.value.filter(model => model.user_id && this._addUsersSet.has(model.id)))
                .sort((a, b) => {
                    const indexA = sortMap.get(this.getUserId(a));
                    const indexB = sortMap.get(this.getUserId(b));
                    if (indexB === undefined) return -1;
                    if (indexA === undefined) return 1;
                    return indexA - indexB;
                })
        );
        this._removeUsersMap = newRemoveMap;
    }

    private getUserId(model: MotionMeetingUser): number {
        return model.user_id ?? model.id;
    }

    private getIntermediateModels(motion: ViewMotion): V[] {
        return motion[this.field] as unknown as V[];
    }

    /**
     * Adds the user to the list, if they aren't already in there.
     */
    private async addUserAsIntermediateModel(model: MotionMeetingUser): Promise<void> {
        if (model instanceof ViewUser) {
            const meetingUser = this.getIntermediateModels(this.motion).find(modelB => {
                return modelB.user_id === model.id;
            });
            if (this._oldIds.has(meetingUser.id)) {
                delete this._removeUsersMap[meetingUser.id];
            } else {
                this._addUsersSet.add(model.id);
            }
        } else if (!model?.user_id) {
            if (this._oldIds.has(model.id)) {
                delete this._removeUsersMap[model.id];
            } else {
                this._addUsersSet.add(model.id);
            }
        }
        const models = this.editSubject.value;
        this.editSubject.next(models.concat(model));
    }

    /**
     * helpers for second Selector
     */
    private get secondSelectorSelectedValue(): string {
        if (!this.secondSelectorFormControl.value) {
            return ``;
        }
        const searchId = +this.secondSelectorFormControl.value;
        const foundEntry = this.secondSelectorValues.find(entry => entry.id === searchId);
        return foundEntry ? foundEntry.getTitle() : ``;
    }

    private changeSecondSelector(): void {
        const value = this.additionalInputControl.value
            ? this.additionalInputControl.value + ` · ` + this.secondSelectorSelectedValue
            : this.secondSelectorSelectedValue;
        this.secondSelectorDisabledIds.push(+this.secondSelectorFormControl.value);
        this.secondSelectorFormControl.setValue(null);
        this.additionalInputControl.setValue(value);
    }
}
