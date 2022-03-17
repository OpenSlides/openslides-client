import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MotionAction } from 'app/core/actions/motion-action';
import { Permission } from 'app/core/core-services/permission';
import { UnsafeHtml } from 'app/core/definitions/key-types';
import { RawUser } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { LineRange } from 'app/core/ui-services/diff.service';
import { Settings } from 'app/shared/models/event-management/meeting';
import { Mediafile } from 'app/shared/models/mediafiles/mediafile';
import { ViewUnifiedChange } from 'app/shared/models/motions/view-unified-change';
import { mediumDialogSettings } from 'app/shared/utils/dialog-settings';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionCategory } from 'app/site/motions/models/view-motion-category';
import { ViewMotionStatuteParagraph } from 'app/site/motions/models/view-motion-statute-paragraph';
import { ViewMotionWorkflow } from 'app/site/motions/models/view-motion-workflow';
import { ChangeRecoMode, LineNumberingMode } from 'app/site/motions/motions.constants';
import { PermissionsService } from 'app/site/motions/services/permissions.service';
import { Subscription } from 'rxjs';

import { deepCopy } from '../../../../../../core/core-services/key-transforms';
import { OperatorService } from '../../../../../../core/core-services/operator.service';
import { MotionServiceCollectorService } from '../../../services/motion-service-collector.service';
import { BaseMotionDetailChildComponent } from '../base/base-motion-detail-child.component';
import {
    MotionChangeRecommendationDialogComponent,
    MotionChangeRecommendationDialogComponentData
} from '../motion-change-recommendation-dialog/motion-change-recommendation-dialog.component';

/**
 * fields that are required for the motion form but are not part of any motion payload
 */
interface MotionFormFields extends MotionAction.CreatePayload {
    // from update payload
    modified_final_version: string;
    // apparently from no payload
    statute_amendment: string;
    statute_paragraph_id: string;
    parent_id: string;
}

type MotionFormControlsConfig = { [key in keyof Partial<MotionFormFields>]: any };

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

    public get canManageMediafiles(): boolean {
        return this.operator.hasPerms(Permission.mediafileCanManage);
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

    public contentForm: FormGroup;

    public workflows: ViewMotionWorkflow[] = [];

    public categories: ViewMotionCategory[] = [];

    /**
     * statute paragraphs, necessary for amendments
     */
    public statuteParagraphs: ViewMotionStatuteParagraph[] = [];

    /**
     * Indicates the currently highlighted line, if any.
     */
    public highlightedLine: number;

    public set canSaveParagraphBasedAmendment(can: boolean) {
        this._canSaveParagraphBasedAmendment = can;
        this.propagateChanges();
    }

    public set paragraphBasedAmendmentContent(content: {
        amendment_paragraph_$: { [paragraph_number: number]: UnsafeHtml };
    }) {
        this._paragraphBasedAmendmentContent = content;
        this.propagateChanges();
    }

    private _canSaveParagraphBasedAmendment = true;
    private _paragraphBasedAmendmentContent: any = {};
    private _motionContent = {};
    private _initialState = {};

    private _editSubscriptions: Subscription[] = [];

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        motionServiceCollector: MotionServiceCollectorService,
        private fb: FormBuilder,
        private dialogService: MatDialog,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private perms: PermissionsService,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate, motionServiceCollector);
    }

    /**
     * clicking Shift and Enter will save automatically
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Enter` && event.shiftKey) {
            this.save.emit(this.contentForm.value);
        }
    }

    /**
     * If the checkbox is deactivated, the statute_paragraph_id-field needs to be reset, as only that field is saved
     *
     * @param {MatCheckboxChange} $event
     */
    public onStatuteAmendmentChange($event: MatCheckboxChange): void {
        this.contentForm.patchValue({
            statute_paragraph_id: null,
            workflow_id: this.getWorkflowIdForCreateFormByParagraph()
        });
    }

    /**
     * The paragraph of the statute to amend was changed -> change the input fields below
     *
     * @param {number} newValue
     */
    public onStatuteParagraphChange(newValue: number): void {
        const selectedParagraph = this.statuteParagraphs.find(par => par.id === newValue);
        this.contentForm.patchValue({
            title: this.translate.instant(`Statute amendment for`) + ` ${selectedParagraph.title}`,
            text: selectedParagraph.text,
            workflow_id: this.getWorkflowIdForCreateFormByParagraph(newValue)
        });
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
    public showUploadError(error: string): void {
        this.raiseError(error);
    }

    /**
     * get the diff html from the statute amendment, as SafeHTML for [innerHTML]
     *
     * @returns safe html strings
     */
    public getFormattedStatuteAmendment(): string {
        return this.motionLineNumbering.formatStatuteAmendment(this.statuteParagraphs, this.motion, this.lineLength);
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
        const formattedText = this.motionFormatService.formatMotion(
            this.motion,
            this.changeRecoMode,
            changes,
            this.lineLength,
            this.highlightedLine
        );
        return formattedText;
    }

    /**
     * In the original version, a line number range has been selected in order to create a new change recommendation
     *
     * @param lineRange
     */
    public createChangeRecommendation(lineRange: LineRange): void {
        const data: MotionChangeRecommendationDialogComponentData = {
            editChangeRecommendation: false,
            newChangeRecommendation: true,
            lineRange,
            changeRecommendation: null
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
        this.dialogService.open(MotionChangeRecommendationDialogComponent, {
            ...mediumDialogSettings,
            data
        });
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
        this.addNewUserToFormCtrl(newUserObj, `submitters_id`);
    }

    public async createNewSupporter(username: string): Promise<void> {
        const newUserObj = await this.createNewUser(username);
        this.addNewUserToFormCtrl(newUserObj, `supporters_id`);
    }

    public getDefaultWorkflowKeyOfSettingsByParagraph(paragraph?: number): keyof Settings {
        let configKey: keyof Settings = `motions_default_workflow_id`;
        if (!!this.contentForm && !!this.contentForm.get(`statute_amendment`).value && !!paragraph) {
            configKey = `motions_default_statute_amendment_workflow_id`;
        } else if (!!this.route.snapshot.queryParams.parent) {
            configKey = `motions_default_amendment_workflow_id`;
        }
        return configKey;
    }

    protected onEnterEditMode(): void {
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
            const tmp = deepCopy(this.motion.motion);
            Object.keys(this.contentForm.controls).forEach(ctrl => {
                contentPatch[ctrl] = tmp[ctrl];
            });

            if (this.isParagraphBasedAmendment) {
                this.contentForm.get(`text`).clearValidators(); // manually adjust validators
            }

            if (this.isExisting && this.motion.isStatuteAmendment()) {
                const statuteAmendmentFieldName = `statute_amendment`;
                contentPatch[statuteAmendmentFieldName] = true;
            }
            this._initialState = deepCopy(contentPatch);
            this.contentForm.patchValue(contentPatch);
        }
    }

    protected onInitTextBasedAmendment(): void {
        this.patchForm();
        this.propagateChanges();
    }

    protected getSubscriptions(): Subscription[] {
        // since updates are usually not coming at the same time, every change to
        // any subject has to mark the view for checking
        if (this.motion) {
            return [
                this.statuteRepo.getViewModelListObservable().subscribe(values => (this.statuteParagraphs = values)),
                this.userRepo.getViewModelListObservable().subscribe(() => this.cd.markForCheck())
            ];
        }
        return [];
    }

    private initContentFormSubscription(): void {
        for (const subscription of this._editSubscriptions) {
            subscription.unsubscribe();
        }
        this._editSubscriptions = [];
        for (const controlName of Object.keys(this.contentForm.controls)) {
            this._editSubscriptions.push(
                this.contentForm.get(controlName).valueChanges.subscribe(value => {
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
        this.formChanged.emit({ ...this._motionContent, ...this._paragraphBasedAmendmentContent });
        this.validStateChanged.emit(this.contentForm.valid && this._canSaveParagraphBasedAmendment);
    }

    private addNewUserToFormCtrl(newUserObj: RawUser, controlName: string): void {
        const control = this.contentForm.get(controlName);
        let currentSubmitters: number[] = control.value;
        if (currentSubmitters?.length) {
            currentSubmitters.push(newUserObj.id);
        } else {
            currentSubmitters = [newUserObj.id];
        }
        control.setValue(currentSubmitters);
    }

    private createNewUser(username: string): Promise<RawUser> {
        return this.userRepo.createFromString(username);
    }

    private getAllTextChangingObjects(): ViewUnifiedChange[] {
        return this.getAllChangingObjectsSorted().filter((obj: ViewUnifiedChange) => !obj.isTitleChange());
    }

    /**
     * Creates the forms for the Motion and the MotionVersion
     */
    private createForm(): FormGroup {
        const motionFormControls: MotionFormControlsConfig = {
            title: [``, Validators.required],
            text: [``, this.isParagraphBasedAmendment ? null : Validators.required],
            reason: [``, this.reasonRequired ? Validators.required : null],
            category_id: [],
            attachment_ids: [[]],
            agenda_parent_id: [],
            submitter_ids: [[]],
            supporter_ids: [[]],
            workflow_id: [],
            tag_ids: [[]],
            statute_amendment: [``], // Internal value for the checkbox, not saved to the model
            statute_paragraph_id: [],
            block_id: [],
            parent_id: [],
            modified_final_version: [``],
            ...(this.canChangeMetadata && {
                number: [``],
                agenda_create: [``],
                agenda_type: [``]
            })
        };

        return this.fb.group(motionFormControls);
    }

    private getWorkflowIdForCreateFormByParagraph(paragraph?: number): number {
        const configKey = this.getDefaultWorkflowKeyOfSettingsByParagraph(paragraph);
        return +this.meetingSettingService.instant(configKey);
    }
}
