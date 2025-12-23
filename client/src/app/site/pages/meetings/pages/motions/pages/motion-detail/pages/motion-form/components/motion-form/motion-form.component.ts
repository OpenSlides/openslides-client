import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
    auditTime,
    BehaviorSubject,
    distinctUntilChanged,
    filter,
    firstValueFrom,
    map,
    skip,
    startWith,
    Subscription,
    tap
} from 'rxjs';
import { Id, UnsafeHtml } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { HasSequentialNumber, Selectable } from 'src/app/domain/interfaces';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { Motion } from 'src/app/domain/models/motions/motion';
import { GetForwardingCommitteesPresenterService } from 'src/app/gateways/presenter/get-forwarding-committees-presenter.service';
import { RawUser, UserRepositoryService } from 'src/app/gateways/repositories/users';
import { deepCopy } from 'src/app/infrastructure/utils/transform-functions';
import { isUniqueAmong } from 'src/app/infrastructure/utils/validators/is-unique-among';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ParticipantListSortService } from '../../../../../../../participants/pages/participant-list/services/participant-list-sort/participant-list-sort.service';
import { getParticipantMinimalSubscriptionConfig } from '../../../../../../../participants/participants.subscription';
import { MotionCategoryControllerService } from '../../../../../../modules/categories/services';
import { MotionWorkflowControllerService } from '../../../../../../modules/workflows/services';
import { MOTION_DETAIL_SUBSCRIPTION } from '../../../../../../motions.subscription';
import { AmendmentControllerService } from '../../../../../../services/common/amendment-controller.service/amendment-controller.service';
import { MotionControllerService } from '../../../../../../services/common/motion-controller.service/motion-controller.service';
import { MotionPermissionService } from '../../../../../../services/common/motion-permission.service/motion-permission.service';

/**
 * fields that are required for the motion form but are not part of any motion payload
 */
interface MotionFormFields {
    // from update payload
    modified_final_version: string;
    // apparently from no payload
    parent_id: string;

    // For agenda creations
    agenda_parent_id: Id;

    // Motion
    workflow_id: Id;
}

type MotionFormControlsConfig = { [key in keyof MotionFormFields]?: any } & { [key in keyof Motion]?: any } & {
    supporter_ids?: any;
    attachment_mediafile_ids?: any;
    agenda_create?: any;
    agenda_type?: any;
};

@Component({
    selector: `os-motion-form`,
    templateUrl: `./motion-form.component.html`,
    styleUrls: [`./motion-form.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class MotionFormComponent extends BaseMeetingComponent implements OnInit {
    public readonly collection = ViewMotion.COLLECTION;

    /**
     * Determine if the motion is a new (unsent) amendment to another motion
     */
    public amendmentEdit = false;

    /**
     * Determine if the motion is new
     */
    public newMotion = false;

    /**
     * Sets the motions, e.g. via an autoupdate. Reload important things here:
     * - Reload the recommendation. Not changed with autoupdates, but if the motion is loaded this needs to run.
     */
    public set motion(motion: ViewMotion) {
        this._motion = motion;
    }

    public get motion(): ViewMotion {
        return this._motion;
    }

    public get canChangeMetadata(): boolean {
        return this.perms.isAllowed(`change_metadata`, this.motion);
    }

    public get canManageAgenda(): boolean {
        return this.perms.canManageAgenda();
    }

    public get canSeeUsers(): boolean {
        return this.operator.hasPerms(Permission.userCanSee);
    }

    public get isParagraphBasedAmendment(): boolean {
        return this.isExisting && this.motion.isParagraphBasedAmendment();
    }

    public get isExisting(): boolean {
        return this.motion instanceof ViewMotion;
    }

    public get hasCategories(): boolean {
        return this.categoryRepo.getViewModelList().length > 0;
    }

    /**
     * Constant to identify the notification-message.
     */
    public NOTIFICATION_EDIT_MOTION = `notifyEditMotion`;

    public contentForm!: UntypedFormGroup;
    public committeeControl!: UntypedFormControl;

    public committeeValues: Selectable[] = [];

    private committeeDisabledIds: number[] = [];

    public set canSaveParagraphBasedAmendment(can: boolean) {
        this._canSaveParagraphBasedAmendment = can;
        this.propagateChanges();
    }

    public set paragraphBasedAmendmentContent(content: { amendment_paragraphs: Record<number, UnsafeHtml> }) {
        this._paragraphBasedAmendmentContent = content;
        this.propagateChanges();
    }

    public participantSubscriptionConfig = getParticipantMinimalSubscriptionConfig(this.activeMeetingId);

    public preamble = ``;
    public reasonRequired = false;
    public minSupporters = 0;
    public allowAdditionalSubmitter = false;

    public temporaryMotion: any = {};

    public canSave = false;

    public hasLoaded = new BehaviorSubject(false);

    private get committeeSelectorValue(): string {
        if (!this.committeeControl.value) {
            return ``;
        }
        const searchId = +this.committeeControl.value;
        const foundEntry = this.committeeValues.find(entry => entry.id === searchId);
        return foundEntry ? foundEntry.getTitle() : ``;
    }

    private titleFieldUpdateSubscription: Subscription;

    private _canSaveParagraphBasedAmendment = true;
    private _paragraphBasedAmendmentContent: any = {};
    private _motionContent: any = {};
    private _initialState: any = {};

    private _editSubscriptions: Subscription[] = [];

    private _motionNumbersSubject = new BehaviorSubject<string[]>([]);

    private _motion: ViewMotion | null = null;
    private _motionId: Id | null = null;
    private _parentId: Id | null = null;

    public constructor(
        protected override translate: TranslateService,
        public vp: ViewPortService,
        public participantRepo: ParticipantControllerService,
        public participantSortService: ParticipantListSortService,
        public userRepo: UserRepositoryService,
        public categoryRepo: MotionCategoryControllerService,
        public workflowRepo: MotionWorkflowControllerService,
        private fb: UntypedFormBuilder,
        private route: ActivatedRoute,
        private motionController: MotionControllerService,
        private amendmentRepo: AmendmentControllerService,
        private perms: MotionPermissionService,
        private prompt: PromptService,
        private cd: ChangeDetectorRef,
        private operator: OperatorService,
        private presenter: GetForwardingCommitteesPresenterService
    ) {
        super();

        this.subscriptions.push(
            this.meetingSettingsService.get(`motions_preamble`).subscribe(value => (this.preamble = value)),
            this.meetingSettingsService
                .get(`motions_reason_required`)
                .subscribe(value => (this.reasonRequired = value)),
            this.meetingSettingsService
                .get(`motions_supporters_min_amount`)
                .subscribe(value => (this.minSupporters = value)),
            this.meetingSettingsService
                .get(`motions_create_enable_additional_submitter_text`)
                .subscribe(value => (this.allowAdditionalSubmitter = value))
        );
    }

    /**
     * Init.
     * Sets all required subjects and fills in the required information
     */
    public ngOnInit(): void {
        this.subscriptions.push(
            this.activeMeetingIdService.meetingIdObservable.subscribe(() => {
                this.hasLoaded.next(false);
            }),
            this.vp.isMobileSubject.subscribe(() => {
                this.cd.markForCheck();
            })
        );
        this.loadForwardingCommitteesFromPresenter();
    }

    /**
     * In the ui are no distinct buttons for update or create. This is decided here.
     */
    public saveMotion(event?: any): () => Promise<void> {
        return async () => {
            const update = event || this.temporaryMotion;
            if (update.supporter_ids && update.supporter_ids.length > 0) {
                update[`supporter_meeting_user_ids`] = [];
                for (const supporterId of update.supporter_ids) {
                    const supporter = this.userRepo.getViewModel(supporterId);
                    update[`supporter_meeting_user_ids`].push(supporter.getMeetingUser().id);
                }
                delete update.supporter_ids;
            }

            if (this.newMotion) {
                if (update.submitter_ids.length === 0 && this.operator.isInMeeting(this.activeMeetingId)) {
                    update.submitter_ids = [this.operator.user.getMeetingUser(this.activeMeetingId).id];
                }
                for (const key in update) {
                    if (update[key] === null || update[key].length === 0) {
                        delete update[key];
                    }
                }
                await this.createMotion(update);
            } else {
                delete update.supporter_ids;
                delete update[`supporter_meeting_user_ids`];
                await this.updateMotion(update, this.motion);
                this.leaveEditMotion();
            }
        };
    }

    public leaveEditMotion(motion: HasSequentialNumber | null = this.motion): void {
        if (motion?.sequential_number) {
            this.router.navigate([this.activeMeetingId, `motions`, motion.sequential_number], { replaceUrl: true });
        } else {
            this.router.navigate([this.activeMeetingId, `motions`], { replaceUrl: true });
        }
    }

    /**
     * Function to prevent automatically closing the window/tab,
     * if the user is editing a motion.
     *
     * @param event The event object from 'onUnbeforeUnload'.
     */
    @HostListener(`window:beforeunload`, [`$event`])
    public stopClosing(event: Event): void {
        if (Object.keys(this._motionContent).length) {
            event.returnValue = false;
        }
    }

    public async onIdFound(id: Id | null): Promise<void> {
        this._motionId = id;
        if (id) {
            await this.loadMotionById();
        } else {
            await this.initNewMotion();
        }

        this.patchForm();
        this.initContentFormSubscription();
        this.propagateChanges();
        this.attachMotionNumbersSubject();

        this.hasLoaded.next(true);
    }

    /**
     * Click handler for attachments
     *
     * @param attachment the selected file
     */
    public onClickAttachment(attachment: Mediafile): void {
        window.open(attachment.url);
    }

    /**
     * Handler for upload errors
     *
     * @param error the error message passed by the upload component
     */
    public showUploadError(error: any): void {
        this.raiseError(error);
    }

    public async createNewSubmitter(username: string): Promise<void> {
        const newUserObj = await this.createNewUser(username);
        this.addNewUserToFormCtrl(newUserObj, `submitter_meeting_user_ids`);
    }

    public async createNewSupporter(username: string): Promise<void> {
        const newUserObj = await this.createNewUser(username);
        this.addNewUserToFormCtrl(newUserObj, `supporters_id`);
    }

    /**
     * Creates a motion. Calls the "patchValues" function in the MotionObject
     */
    public async createMotion(newMotionValues: Partial<Motion>): Promise<void> {
        try {
            this.cleanAgendaIfNoPerm(newMotionValues);
            if (!newMotionValues.additional_submitter || !this.allowAdditionalSubmitter) {
                delete newMotionValues.additional_submitter;
            }
            let response: HasSequentialNumber;
            if (this._parentId) {
                response = await this.amendmentRepo.createTextBased({
                    ...newMotionValues,
                    lead_motion_id: this._parentId
                });
            } else {
                response = (await this.motionController.create(newMotionValues))[0];
            }
            this.leaveEditMotion(response);
        } catch (e) {
            this.raiseError(e);
        }
    }

    public getCommitteeDisabledFn(): (v: Selectable) => boolean {
        return (value: Selectable) => this.committeeDisabledIds.includes(value.id);
    }

    public committeeSelectorOpenedChange(opened: boolean): void {
        if (!opened) {
            this.committeeDisabledIds = [];
        }
    }

    /**
     * Async load the values of the motion in the Form.
     */
    protected patchForm(): void {
        if (!this.contentForm) {
            [this.contentForm, this.committeeControl] = this.createForm();
            this.subscriptions.push(
                this.committeeControl.valueChanges.subscribe(value => {
                    if (value) {
                        this.changeCommitteeSelector();
                    }
                })
            );
        }

        const contentPatch: Record<string, any> = {};
        Object.keys(this.contentForm.controls).forEach(ctrl => {
            if (this.isExisting || this.motion[ctrl]) {
                contentPatch[ctrl] = this.motion[ctrl];
            }
        });

        if (this.contentForm.controls[`attachment_mediafile_ids`]) {
            contentPatch[`attachment_mediafile_ids`] = this.motion.attachment_meeting_mediafiles?.map(
                file => file.mediafile_id
            );
        }

        if (this.isParagraphBasedAmendment) {
            this.contentForm.get(`text`)?.clearValidators(); // manually adjust validators
        }

        if (this.isExisting) {
            this._initialState = deepCopy(contentPatch);
        }
        this.contentForm.patchValue(contentPatch);

        if (this.amendmentEdit && !this.titleFieldUpdateSubscription) {
            const parentId = Number(this.route.snapshot.queryParams[`parent`]);
            if (parentId && !Number.isNaN(parentId)) {
                this.titleFieldUpdateSubscription = this.motionController
                    .getViewModelObservable(parentId)
                    .pipe(
                        map(parent => {
                            return { number: parent?.number, text: parent?.text };
                        }),
                        distinctUntilChanged((p, c) => p.text === c.text),
                        skip(1)
                    )
                    .subscribe(value => {
                        this.prompt
                            .open(
                                this.translate.instant(`Parent motion text changed`),
                                this.translate.instant(
                                    `Do you want to update the amendment text? All changes will be lost.`
                                )
                            )
                            .then(choice => {
                                if (choice) {
                                    this.contentForm.patchValue({ text: value.text });
                                }
                            });
                    });
                this.subscriptions.push(this.titleFieldUpdateSubscription);
            }
        }
    }

    private async initNewMotion(): Promise<void> {
        // new motion
        super.setTitle(`New motion`);
        this.newMotion = true;
        if (this.route.snapshot.queryParams[`parent`]) {
            await this.initializeAmendment();
        } else {
            this.motion = {} as any;
        }

        this.cd.markForCheck();
    }

    private async loadMotionById(motionId: Id | null = this._motionId): Promise<void> {
        await this.modelRequestService.waitSubscriptionReady(MOTION_DETAIL_SUBSCRIPTION);
        const motion = await firstValueFrom(this.motionController.getViewModelObservable(motionId));
        if (motion) {
            const title = motion.getTitle();
            super.setTitle(title);
            this.motion = motion;

            this.newMotion = false;
            this.showMotionEditConflictWarningIfNecessary();
        }

        this.cd.markForCheck();

        this.subscriptions.push(
            this.motionController
                .getViewModelObservable(motionId)
                .pipe(
                    tap(motion => {
                        if (this.contentForm) {
                            for (const ctrl of Object.keys(this.contentForm.controls)) {
                                if (this.contentForm.get(ctrl).pristine) {
                                    this.contentForm.get(ctrl).setValue(motion[ctrl]);
                                }
                            }
                        }
                    }),
                    distinctUntilChanged((_, c) => {
                        for (const ctrl of Object.keys(this.contentForm.controls)) {
                            if (JSON.stringify(c[ctrl]) !== JSON.stringify(this.contentForm.get(ctrl).value)) {
                                return false;
                            }
                        }

                        return true;
                    }),
                    auditTime(2000),
                    skip(1)
                )
                .subscribe(motion => {
                    if (motion) {
                        const title = motion.getTitle();
                        super.setTitle(title);
                        this.motion = motion;
                        this.prompt
                            .open(
                                this.translate.instant(`Motion changed`),
                                this.translate.instant(
                                    `Are you sure you want to discard all changes and update this form?`
                                )
                            )
                            .then(choice => {
                                if (choice) {
                                    this.patchForm();
                                }
                            });
                    }
                })
        );
    }

    private async updateMotion(newMotionValues: any, motion: ViewMotion): Promise<void> {
        this.cleanAgendaIfNoPerm(newMotionValues);
        delete newMotionValues.additional_submitter;
        try {
            await this.motionController.update(newMotionValues, motion).resolve();
        } catch (e) {
            this.raiseError(e);
        }
    }

    private cleanAgendaIfNoPerm(newMotionValues: any): void {
        if (!this.canManageAgenda) {
            delete newMotionValues[`agenda_create`];
            delete newMotionValues[`agenda_type`];
            delete newMotionValues[`agenda_parent_id`];
        }
    }

    private async ensureParentIsAvailable(parentId: Id): Promise<ViewMotion> {
        let motion: ViewMotion = this.motionController.getViewModel(parentId);
        if (!motion || motion.text === undefined) {
            motion = await firstValueFrom(
                this.motionController
                    .getViewModelObservable(parentId)
                    .pipe(
                        filter(
                            motion =>
                                !!motion?.id &&
                                (motion.text !== undefined ||
                                    this.meetingSettingsService.instant(`motions_amendments_text_mode`) !== `fulltext`)
                        )
                    )
            );
        }

        return motion;
    }

    private async initializeAmendment(): Promise<void> {
        const motion: any = {};
        this._parentId = +this.route.snapshot.queryParams[`parent`] || null;
        this.amendmentEdit = true;
        const parentMotion = await this.ensureParentIsAvailable(this._parentId!);
        motion.lead_motion_id = this._parentId;
        if (parentMotion) {
            const defaultTitle = `${this.translate.instant(`Amendment to`)} ${parentMotion.numberOrTitle}`;
            motion.title = defaultTitle;
            motion.category_id = parentMotion.category_id;
            motion.workflow_id = +this.meetingSettingsService.instant(`motions_default_amendment_workflow_id`);
            const amendmentTextMode = this.meetingSettingsService.instant(`motions_amendments_text_mode`);
            if (amendmentTextMode === `fulltext`) {
                motion.text = parentMotion.text;
            }
            this.motion = motion;
        } else {
            this.motion = {} as any;
        }
    }

    private initContentFormSubscription(): void {
        for (const subscription of this._editSubscriptions) {
            subscription.unsubscribe();
        }
        this._editSubscriptions = [];
        for (const controlName of Object.keys(this.contentForm.controls)) {
            const subscription = this.contentForm
                .get(controlName)!
                .valueChanges.pipe(startWith(this.contentForm.get(controlName).getRawValue()))
                .subscribe(value => {
                    if (JSON.stringify(value) !== JSON.stringify(this._initialState[controlName])) {
                        this._motionContent[controlName] = value;
                    } else {
                        delete this._motionContent[controlName];
                    }
                    setTimeout(() => this.propagateChanges());
                });
            this._editSubscriptions.push(subscription);
            this.subscriptions.push(subscription);
        }
    }

    private attachMotionNumbersSubject(): void {
        this.subscriptions.push(
            this.motionController
                .getViewModelListObservable()
                .pipe(
                    map(motions =>
                        motions
                            .filter(
                                motion =>
                                    motion.number !== this.motion?.number &&
                                    (!motion.id || motion.id !== this.motion?.id)
                            )
                            .map(motion => motion.number)
                    )
                )
                .subscribe(this._motionNumbersSubject)
        );
    }

    private showMotionEditConflictWarningIfNecessary(): void {
        if (
            this.motion.amendments?.filter(amend => amend.isParagraphBasedAmendment()).length > 0 ||
            this.motion.change_recommendations.length > 0
        ) {
            const msg = this.translate.instant(
                `Warning: Amendments or change recommendations exist for this motion. Editing this text will likely impact them negatively. Particularily, amendments might become unusable if the paragraph they affect is deleted, or change recommendations might lose their reference line completely.`
            );
            this.raiseWarning(msg);
        }
    }

    private propagateChanges(): void {
        this.canSave = this.contentForm.valid && this._canSaveParagraphBasedAmendment;
        this.temporaryMotion = { ...this._motionContent, ...this._paragraphBasedAmendmentContent };
        this.cd.markForCheck();
    }

    private addNewUserToFormCtrl(newUserObj: RawUser, controlName: string): void {
        const control = this.contentForm.get(controlName)!;
        let currentSubmitters: number[] = control.value;
        if (currentSubmitters?.length) {
            currentSubmitters.push(newUserObj.id);
        } else {
            currentSubmitters = [newUserObj.id];
        }
        control.setValue(currentSubmitters);
    }

    private createNewUser(username: string): Promise<RawUser> {
        return this.participantRepo.createFromString(username);
    }

    /**
     * Creates the forms for the Motion and the MotionVersion
     */
    private createForm(): [UntypedFormGroup, UntypedFormControl] {
        const motionFormControls: MotionFormControlsConfig = {
            title: [``, Validators.required],
            text: [``, this.isParagraphBasedAmendment ? null : Validators.required],
            reason: [``, this.meetingSettingsService.instant(`motions_reason_required`) ? Validators.required : null],
            category_id: [],
            attachment_mediafile_ids: [[]],
            agenda_parent_id: [],
            submitter_ids: [[]],
            additional_submitter: [``],
            supporter_ids: [[]],
            workflow_id: [
                +this.meetingSettingsService.instant(
                    this.amendmentEdit ? `motions_default_amendment_workflow_id` : `motions_default_workflow_id`
                )
            ],
            tag_ids: [[]],
            block_id: [],
            parent_id: [],
            modified_final_version: [``],
            ...(this.canChangeMetadata && {
                number: [
                    ``,
                    isUniqueAmong<string>(this._motionNumbersSubject, (a, b) => a === b, [``, null, undefined])
                ]
            }),
            agenda_create: [``],
            agenda_type: [``]
        };

        return [this.fb.group(motionFormControls), this.fb.control(``)];
    }

    private changeCommitteeSelector(): void {
        const value = this.contentForm.get(`additional_submitter`).value
            ? this.contentForm.get(`additional_submitter`).value + ` · ` + this.committeeSelectorValue
            : this.committeeSelectorValue;
        this.committeeDisabledIds.push(+this.committeeControl.value);
        this.committeeControl.setValue(null);
        this.contentForm.get(`additional_submitter`).setValue(value);
    }

    private async loadForwardingCommitteesFromPresenter(): Promise<void> {
        const meetingId = this.activeMeetingService.meetingId;
        const committees =
            this.operator.hasPerms(Permission.motionCanManageMetadata) && !!meetingId
                ? await this.presenter.call({ meeting_id: meetingId })
                : [];
        const forwardingCommittees: (Selectable & { name: string; toString: any })[] = [];
        for (let n = 0; n < committees.length; n++) {
            forwardingCommittees.push({
                id: n + 1,
                name: committees[n],
                getTitle: () => committees[n],
                getListTitle: () => ``,
                toString: () => committees[n]
            });
        }

        this.committeeValues = forwardingCommittees;
    }
}
