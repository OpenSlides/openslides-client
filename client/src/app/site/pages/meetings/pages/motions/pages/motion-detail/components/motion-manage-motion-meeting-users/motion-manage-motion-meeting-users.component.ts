import { Component, Input, OnInit } from '@angular/core';
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
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { BaseMotionMeetingUserControllerService } from '../../../../modules/util';
import { MotionControllerService } from '../../../../services/common/motion-controller.service';
import { MotionPermissionService } from '../../../../services/common/motion-permission.service/motion-permission.service';

type MotionMeetingUser = Selectable & { fqid?: Fqid; user_id?: Id };

interface IdMap {
    [user_id: number]: number;
}

@Component({
    selector: `os-motion-manage-motion-meeting-users`,
    templateUrl: `./motion-manage-motion-meeting-users.component.html`,
    styleUrls: [`./motion-manage-motion-meeting-users.component.scss`]
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

    public get intermediateModels(): V[] {
        return this.getIntermediateModels(this.motion);
    }

    /**
     * The current list of intermediate models.
     */
    public readonly editSubject = new BehaviorSubject<MotionMeetingUser[]>([]);
    public editUserIds: number[] = [];

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
        private actionService: ActionService
    ) {
        super();

        this.editObservable = this.editSubject as Observable<Selectable[]>;
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.editSubject.subscribe(ids => (this.editUserIds = ids.map(model => model.user_id ?? model.id)))
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
                              map(motion => this.getIntermediateModels(motion).find(model => model.user_id === val.id)),
                              filter(model => !!model)
                          )
                      )
            )
        );

        await Action.from(...actions).resolve();

        const result = await promise;
        this.repo.sort(result, this.motion).resolve();
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
        this.editSubject.next(this.intermediateModels);
        this._oldIds = new Set(this.intermediateModels.map(model => model.user_id));
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
            this._removeUsersMap[model.user_id] = model.id;
        } else if (this._addUsersSet.has(model.id)) {
            this._addUsersSet.delete(model.id);
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

    private updateData(models: V[]): void {
        if (!this.isEditMode) {
            this.editSubject.next(models);
            return;
        }
        const newRemoveMap: IdMap = {};
        const sortMap = new Map(this.editSubject.value.map((model, index) => [this.getUserId(model), index]));
        for (const model of models) {
            if (this._removeUsersMap[model.user_id]) {
                newRemoveMap[model.user_id] = model.id;
            } else if (this._addUsersSet.has(model.user_id)) {
                this._addUsersSet.delete(model.user_id);
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
        if (!model?.user_id) {
            if (this._oldIds.has(model.id)) {
                delete this._removeUsersMap[model.id];
            } else {
                this._addUsersSet.add(model.id);
            }
        }
        const models = this.editSubject.value;
        this.editSubject.next(models.concat(model));
    }
}
