import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, distinctUntilChanged, map, Subscription } from 'rxjs';
import { Id, UnsafeHtml } from 'src/app/domain/definitions/key-types';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { Settings } from 'src/app/domain/models/meetings/meeting';
import { Motion } from 'src/app/domain/models/motions/motion';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import { RawUser } from 'src/app/gateways/repositories/users';
import { deepCopy } from 'src/app/infrastructure/utils/transform-functions';
import { isUniqueAmong } from 'src/app/infrastructure/utils/validators/is-unique-among';
import { ViewMotion, ViewMotionCategory, ViewMotionWorkflow } from 'src/app/site/pages/meetings/pages/motions';
import { LineRange } from 'src/app/site/pages/meetings/pages/motions/definitions';
import { ViewUnifiedChange } from 'src/app/site/pages/meetings/pages/motions/modules/change-recommendations/view-models/view-unified-change';

import { ParticipantListSortService } from '../../../../../participants/pages/participant-list/services/participant-list-sort/participant-list-sort.service';
import { getParticipantMinimalSubscriptionConfig } from '../../../../../participants/participants.subscription';
import { MotionControllerService } from '../../../../services/common/motion-controller.service';
import { MotionPermissionService } from '../../../../services/common/motion-permission.service/motion-permission.service';
import { BaseMotionDetailChildComponent } from '../../base/base-motion-detail-child.component';
import { MotionContentChangeRecommendationDialogComponentData } from '../../modules/motion-change-recommendation-dialog/components/motion-content-change-recommendation-dialog/motion-content-change-recommendation-dialog.component';
import { MotionChangeRecommendationDialogService } from '../../modules/motion-change-recommendation-dialog/services/motion-change-recommendation-dialog.service';

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
};

@Component({
    selector: `os-motion-content`,
    templateUrl: `./motion-content.component.html`,
    styleUrls: [`./motion-content.component.scss`]
})
export class MotionContentComponent extends BaseMotionDetailChildComponent {
    @Output()
    public save = new EventEmitter<ViewMotion>();

    @Output()
    public formChanged = new EventEmitter<ViewMotion>();

    @Output()
    public validStateChanged = new EventEmitter<boolean>();

    private finalEditMode = false;

    public get showPreamble(): boolean {
        return this.motion?.showPreamble;
    }

    public get canChangeMetadata(): boolean {
        return this.perms.isAllowed(`change_metadata`, this.motion);
    }

    /**
     * check if the 'final version edit mode' is active
     *
     * @returns true if active
     */
    public get isFinalEdit(): boolean {
        return this.finalEditMode;
    }

    public get isParagraphBasedAmendment(): boolean {
        return this.isExisting && this.motion.isParagraphBasedAmendment();
    }

    public get hasAttachments(): boolean {
        return this.isExisting && this.motion?.hasAttachments();
    }

    public get isExisting(): boolean {
        return this.motion instanceof ViewMotion;
    }

    public get motionValues(): Partial<ViewMotion> {
        return this.contentForm.value;
    }

    public get hasCategories(): boolean {
        return this.categoryRepo.getViewModelList().length > 0;
    }

    /**
     * Constant to identify the notification-message.
     */
    public NOTIFICATION_EDIT_MOTION = `notifyEditMotion`;

    public readonly ChangeRecoMode = ChangeRecoMode;

    public readonly LineNumberingMode = LineNumberingMode;

    public contentForm!: UntypedFormGroup;

    public workflows: ViewMotionWorkflow[] = [];

    public categories: ViewMotionCategory[] = [];

    /**
     * Indicates the currently highlighted line, if any.
     */
    public highlightedLine!: number;

    public set canSaveParagraphBasedAmendment(can: boolean) {
        this._canSaveParagraphBasedAmendment = can;
        this.propagateChanges();
    }

    public set paragraphBasedAmendmentContent(content: {
        amendment_paragraphs: { [paragraph_number: number]: UnsafeHtml };
    }) {
        this._paragraphBasedAmendmentContent = content;
        this.propagateChanges();
    }

    public participantSubscriptionConfig = getParticipantMinimalSubscriptionConfig(this.activeMeetingId);

    private titleFieldUpdateSubscription: Subscription;

    private _canSaveParagraphBasedAmendment = true;
    private _paragraphBasedAmendmentContent: any = {};
    private _motionContent: any = {};
    private _initialState: any = {};

    private _editSubscriptions: Subscription[] = [];

    private _motionNumbersSubject = new BehaviorSubject<string[]>([]);

    public constructor(
        protected override translate: TranslateService,
        private fb: UntypedFormBuilder,
        private dialog: MotionChangeRecommendationDialogService,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private perms: MotionPermissionService,
        private motionController: MotionControllerService,
        public participantSortService: ParticipantListSortService
    ) {
        super();
        this.motionController
            .getViewModelListObservable()
            .subscribe(motions => this.updateMotionNumbersSubject(motions));
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

    /**
     * get the formatted motion text from the repository.
     *
     * @returns formatted motion texts
     */
    public getFormattedTextPlain(): string {
        // Prevent this.sortedChangingObjects to be reordered from within formatMotion
        let changes: ViewUnifiedChange[];
        if (this.changeRecoMode === ChangeRecoMode.Original) {
            changes = [];
        } else {
            changes = Object.assign([], this.getAllTextChangingObjects());
        }
        if (this.lineLength) {
            const formattedText = this.motionFormatService.formatMotion({
                targetMotion: this.motion,
                crMode: this.changeRecoMode,
                changes,
                lineLength: this.lineLength,
                highlightedLine: this.highlightedLine,
                firstLine: this.motion.firstLine
            });
            return formattedText;
        } else {
            return this.motion.text;
        }
    }

    /**
     * In the original version, a line number range has been selected in order to create a new change recommendation
     *
     * @param lineRange
     */
    public createChangeRecommendation(lineRange: LineRange): void {
        const data: MotionContentChangeRecommendationDialogComponentData = {
            editChangeRecommendation: false,
            newChangeRecommendation: true,
            lineRange,
            changeRecommendation: null,
            firstLine: this.motion.firstLine
        };
        if (this.motion.isParagraphBasedAmendment()) {
            try {
                const lineNumberedParagraphs = this.motionLineNumbering //
                    .getAllAmendmentParagraphsWithOriginalLineNumbers(this.motion, this.lineLength, false);
                data.changeRecommendation = this.changeRecoRepo.createAmendmentChangeRecommendationTemplate(
                    this.motion,
                    lineNumberedParagraphs,
                    lineRange
                );
            } catch (e) {
                console.error(e);
                return;
            }
        } else {
            data.changeRecommendation = this.changeRecoRepo.createMotionChangeRecommendationTemplate(
                this.motion,
                lineRange,
                this.lineLength
            );
        }
        this.dialog.openContentChangeRecommendationDialog(data);
    }

    public getChangesForDiffMode(): ViewUnifiedChange[] {
        return this.getAllChangingObjectsSorted().filter(change => {
            if (this.showAllAmendments) {
                return true;
            } else {
                return change.showInDiffView();
            }
        });
    }

    public async createNewSubmitter(username: string): Promise<void> {
        const newUserObj = await this.createNewUser(username);
        this.addNewUserToFormCtrl(newUserObj, `submitter_ids`);
    }

    public async createNewSupporter(username: string): Promise<void> {
        const newUserObj = await this.createNewUser(username);
        this.addNewUserToFormCtrl(newUserObj, `supporters_id`);
    }

    public getDefaultWorkflowKeyOfSettingsByParagraph(_paragraph: number): keyof Settings {
        let configKey: keyof Settings = `motions_default_workflow_id`;
        if (!!this.route.snapshot.queryParams[`parent`]) {
            configKey = `motions_default_amendment_workflow_id`;
        }
        return configKey;
    }

    protected override onEnterEditMode(): void {
        this.patchForm();
        this.initContentFormSubscription();
        this.propagateChanges();
    }

    /**
     * Async load the values of the motion in the Form.
     */
    protected patchForm(): void {
        if (!this.contentForm) {
            this.contentForm = this.createForm();
        }
        if (this.isExisting) {
            const contentPatch: { [key: string]: any } = {};
            Object.keys(this.contentForm.controls).forEach(ctrl => {
                contentPatch[ctrl] = this.motion[ctrl];
            });

            if (this.isParagraphBasedAmendment) {
                this.contentForm.get(`text`)?.clearValidators(); // manually adjust validators
            }

            this._initialState = deepCopy(contentPatch);
            this.contentForm.patchValue(contentPatch);
        } else {
            const parentId = Number(this.route.snapshot.queryParams[`parent`]);
            if (parentId && !Number.isNaN(parentId)) {
                if (!this.titleFieldUpdateSubscription) {
                    this.titleFieldUpdateSubscription = this.repo
                        .getViewModelObservable(parentId)
                        .pipe(
                            map(parent => {
                                return { number: parent?.number, text: parent?.text };
                            }),
                            distinctUntilChanged()
                        )
                        .subscribe(data => {
                            if (!this.contentForm.get(`title`).value) {
                                const title = this.translate.instant(`Amendment to`) + ` ${data.number}`;
                                this.contentForm.patchValue({
                                    title: title
                                });
                                this._motionContent[`title`] = title;
                                this.propagateChanges();
                            }
                            if (
                                !this.contentForm.get(`text`).value &&
                                this.meetingSettingsService.instant(`motions_amendments_text_mode`) === `fulltext`
                            ) {
                                this.contentForm.patchValue({
                                    text: data.text
                                });
                                this._motionContent[`text`] = data.text;
                                this.propagateChanges();
                            }
                        });
                }
            }
        }
    }

    protected override onInitTextBasedAmendment(): void {
        this.patchForm();
        this.propagateChanges();
    }

    protected override getSubscriptions(): Subscription[] {
        // since updates are usually not coming at the same time, every change to
        // any subject has to mark the view for checking
        if (this.motion) {
            return [this.participantRepo.getViewModelListObservable().subscribe(() => this.cd.markForCheck())];
        }
        return [];
    }

    protected override onAfterInit(): void {
        this.updateMotionNumbersSubject();
    }

    private updateMotionNumbersSubject(motions?: ViewMotion[]): void {
        this._motionNumbersSubject.next(
            (motions ?? this.motionController.getViewModelList())
                .filter(
                    motion => motion.number !== this.motion?.number && (!motion.id || motion.id !== this.motion?.id)
                )
                .map(motion => motion.number)
        );
    }

    private initContentFormSubscription(): void {
        for (const subscription of this._editSubscriptions) {
            subscription.unsubscribe();
        }
        this._editSubscriptions = [];
        for (const controlName of Object.keys(this.contentForm.controls)) {
            this._editSubscriptions.push(
                this.contentForm.get(controlName)!.valueChanges.subscribe(value => {
                    if (JSON.stringify(value) !== JSON.stringify(this._initialState[controlName])) {
                        this._motionContent[controlName] = value;
                    } else {
                        delete this._motionContent[controlName];
                    }
                    this.propagateChanges();
                })
            );
        }
    }

    private propagateChanges(): void {
        setTimeout(() => {
            this.formChanged.emit({ ...this._motionContent, ...this._paragraphBasedAmendmentContent });
            this.validStateChanged.emit(this.contentForm.valid && this._canSaveParagraphBasedAmendment);
        });
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

    private getAllTextChangingObjects(): ViewUnifiedChange[] {
        return this.getAllChangingObjectsSorted().filter((obj: ViewUnifiedChange) => !obj.isTitleChange());
    }

    /**
     * Creates the forms for the Motion and the MotionVersion
     */
    private createForm(): UntypedFormGroup {
        const motionFormControls: MotionFormControlsConfig = {
            title: [``, Validators.required],
            text: [``, this.isParagraphBasedAmendment ? null : Validators.required],
            reason: [``, this.reasonRequired ? Validators.required : null],
            category_id: [],
            attachment_ids: [[]],
            agenda_parent_id: [],
            submitter_ids: [[]],
            supporter_ids: [[]],
            workflow_id: [+this.meetingSettingsService.instant(`motions_default_workflow_id`)],
            tag_ids: [[]],
            block_id: [],
            parent_id: [],
            modified_final_version: [``],
            ...(this.canChangeMetadata && {
                number: [
                    ``,
                    isUniqueAmong<string>(this._motionNumbersSubject, (a, b) => a === b, [``, null, undefined])
                ],
                agenda_create: [``],
                agenda_type: [``]
            })
        };

        return this.fb.group(motionFormControls);
    }
}
