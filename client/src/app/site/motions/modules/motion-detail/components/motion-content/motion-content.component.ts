import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { MotionAction } from 'app/core/actions/motion-action';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { MotionChangeRecommendationRepositoryService } from 'app/core/repositories/motions/motion-change-recommendation-repository.service';
import {
    MotionLineNumberingService,
    ParagraphToChoose
} from 'app/core/repositories/motions/motion-line-numbering.service';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { MotionStatuteParagraphRepositoryService } from 'app/core/repositories/motions/motion-statute-paragraph-repository.service';
import { MotionWorkflowRepositoryService } from 'app/core/repositories/motions/motion-workflow-repository.service';
import { NewUser, UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { LineRange } from 'app/core/ui-services/diff.service';
import { Settings } from 'app/shared/models/event-management/meeting';
import { Mediafile } from 'app/shared/models/mediafiles/mediafile';
import { ViewUnifiedChange } from 'app/shared/models/motions/view-unified-change';
import { mediumDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionCategory } from 'app/site/motions/models/view-motion-category';
import { ViewMotionChangeRecommendation } from 'app/site/motions/models/view-motion-change-recommendation';
import { ViewMotionStatuteParagraph } from 'app/site/motions/models/view-motion-statute-paragraph';
import { ViewMotionWorkflow } from 'app/site/motions/models/view-motion-workflow';
import { ChangeRecoMode, LineNumberingMode } from 'app/site/motions/motions.constants';
import { PermissionsService } from 'app/site/motions/services/permissions.service';
import {
    MotionChangeRecommendationDialogComponent,
    MotionChangeRecommendationDialogComponentData
} from '../motion-change-recommendation-dialog/motion-change-recommendation-dialog.component';
import { MotionViewService } from '../../../services/motion-view.service';

@Component({
    selector: 'os-motion-content',
    templateUrl: './motion-content.component.html',
    styleUrls: ['./motion-content.component.scss']
})
export class MotionContentComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input()
    public motion: ViewMotion;

    @Input()
    public newMotion = false;

    @Input()
    public set editMotion(isEditing: boolean) {
        if (isEditing) {
            this.enterEditMode();
        } else {
            this.leaveEditMode();
        }
    }

    public get editMotion(): boolean {
        return this._isEditing;
    }

    @Output()
    public save = new EventEmitter<ViewMotion>();

    @Output()
    public changeForm = new EventEmitter<ViewMotion>();

    @Output()
    public isFormValid = new EventEmitter<boolean>();

    private finalEditMode = false;

    public get showPreamble(): boolean {
        return this.motion?.showPreamble;
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

    public get lnMode(): LineNumberingMode {
        return this.viewService.currentLineNumberingMode;
    }

    public get changeRecoMode(): ChangeRecoMode {
        return this.viewService.currentChangeRecommendationMode;
    }

    /**
     * Constant to identify the notification-message.
     */
    public NOTIFICATION_EDIT_MOTION = 'notifyEditMotion';

    public readonly ChangeRecoMode = ChangeRecoMode;

    public readonly LineNumberingMode = LineNumberingMode;

    public contentForm: FormGroup;

    public workflows: ViewMotionWorkflow[] = [];

    public categories: ViewMotionCategory[] = [];

    /**
     * Value for os-motion-detail-diff: when this is set, that component scrolls to the given change
     */
    public scrollToChange: ViewUnifiedChange = null;

    /**
     * All change recommendations to this motion
     */
    public changeRecommendations: ViewMotionChangeRecommendation[];
    private amendments: ViewMotion[] = [];

    /**
     * statute paragraphs, necessary for amendments
     */
    public statuteParagraphs: ViewMotionStatuteParagraph[] = [];

    /**
     * Value of the config variable `motions_reason_required`
     */
    public reasonRequired = false;

    /**
     * Value of the config variable `motions_statutes_enabled` - are statutes enabled?
     */
    public statutesEnabled: boolean;

    /**
     * Value of the config variable `motions_preamble`
     */
    public preamble: string;

    /**
     * Value of the config variable `motions_supporters_min_amount`
     */
    public minSupporters = 0;

    private _isEditing = false;

    /**
     * All change recommendations AND amendments, sorted by line number.
     */
    private sortedChangingObjects: ViewUnifiedChange[] = null;

    /**
     * Indicates the maximum line length as defined in the configuration.
     */
    private lineLength: number;

    /**
     * Show all amendments in the text, not only the ones with the apropriate state
     */
    public showAllAmendments = false;

    /**
     * Indicates the currently highlighted line, if any.
     */
    public highlightedLine: number;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private formBuilder: FormBuilder,
        private repo: MotionRepositoryService,
        private changeRecoRepo: MotionChangeRecommendationRepositoryService,
        private dialogService: MatDialog,
        private motionLineNumbering: MotionLineNumberingService,
        private router: Router,
        private route: ActivatedRoute,
        public userRepo: UserRepositoryService,
        public workflowRepo: MotionWorkflowRepositoryService,
        public categoryRepo: MotionCategoryRepositoryService,
        private statuteRepo: MotionStatuteParagraphRepositoryService,
        private viewService: MotionViewService,
        private cd: ChangeDetectorRef,
        public perms: PermissionsService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        this.contentForm = this.createForm();
        this.patchForm();
        this.subscriptions.push(...this.subscribeToSettings(), ...this.subscribeToObservers());
        this.subscriptions.push(
            this.contentForm.valueChanges.subscribe(value => {
                this.changeForm.emit(value);
                this.isFormValid.emit(this.contentForm.valid);
            })
        );
    }

    private enterEditMode(): void {
        this._isEditing = true;
        this.patchForm();
    }

    private leaveEditMode(): void {
        this._isEditing = false;
    }

    /**
     * Async load the values of the motion in the Form.
     */
    public patchForm(): void {
        if (!this.contentForm) {
            this.contentForm = this.createForm();
        }
        if (this.motion) {
            let contentPatch: { [key: string]: any } = {};
            Object.keys(this.contentForm.controls).forEach(ctrl => {
                contentPatch[ctrl] = this.motion[ctrl];
            });

            if (this.isExisting && this.motion.isParagraphBasedAmendment()) {
                contentPatch = { ...contentPatch, ...this.initParagraphBasedAmendment() };
            }

            const statuteAmendmentFieldName = 'statute_amendment';
            contentPatch[statuteAmendmentFieldName] = this.isExisting && this.motion.isStatuteAmendment();
            this.contentForm.patchValue(contentPatch);
        }
    }

    /**
     * clicking Shift and Enter will save automatically
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && event.shiftKey) {
            this.save.emit(this.contentForm.value);
        }
    }

    /**
     * Creates a motion. Calls the "patchValues" function in the MotionObject
     */
    public async createMotion(): Promise<void> {
        const newMotionValues: Partial<MotionAction.CreatePayload> = { ...this.contentForm.value };
        try {
            const response = await this.repo.create(newMotionValues);
            this.router.navigate([this.activeMeetingId, 'motions' + response.id]);
        } catch (e) {
            this.raiseError(e);
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
            title: this.translate.instant('Statute amendment for') + ` ${selectedParagraph.title}`,
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
     * get the formated motion text from the repository.
     *
     * @returns formated motion texts
     */
    public getFormattedTextPlain(): string {
        // Prevent this.sortedChangingObjects to be reordered from within formatMotion
        let changes: ViewUnifiedChange[];
        if (this.changeRecoMode === ChangeRecoMode.Original) {
            changes = [];
        } else {
            changes = Object.assign([], this.getAllTextChangingObjects());
        }
        const formattedText = this.motionLineNumbering.formatMotion(
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
            lineRange: lineRange,
            changeRecommendation: null
        };
        if (this.motion.isParagraphBasedAmendment()) {
            const lineNumberedParagraphs = this.motionLineNumbering.getAllAmendmentParagraphsWithOriginalLineNumbers(
                this.motion,
                this.lineLength,
                false
            );
            data.changeRecommendation = this.changeRecoRepo.createAmendmentChangeRecommendationTemplate(
                this.motion,
                lineNumberedParagraphs,
                lineRange
            );
        } else {
            data.changeRecommendation = this.changeRecoRepo.createMotionChangeRecommendationTemplate(
                this.motion,
                lineRange,
                this.lineLength
            );
        }
        this.dialogService.open(MotionChangeRecommendationDialogComponent, {
            ...mediumDialogSettings,
            data: data
        });
    }

    /**
     * In the original version, a change-recommendation-annotation has been clicked
     * -> Go to the diff view and scroll to the change recommendation
     */
    public gotoChangeRecommendation(changeRecommendation: ViewMotionChangeRecommendation): void {
        this.scrollToChange = changeRecommendation;
        this.viewService.nextChangeRecoMode(ChangeRecoMode.Diff);
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
        this.addNewUserToFormCtrl(newUserObj, 'submitters_id');
    }

    public async createNewSupporter(username: string): Promise<void> {
        const newUserObj = await this.createNewUser(username);
        this.addNewUserToFormCtrl(newUserObj, 'supporters_id');
    }

    private initParagraphBasedAmendment(): object {
        const contentPatch: { [key: string]: any } = {};
        contentPatch.selected_paragraphs = [];
        const leadMotion = this.motion.lead_motion;
        // Hint: lineLength is sometimes not loaded yet when this form is initialized;
        // This doesn't hurt as long as patchForm is called when editing mode is started, i.e., later.
        if (leadMotion && this.lineLength) {
            const paragraphsToChoose = this.motionLineNumbering.getParagraphsToChoose(leadMotion, this.lineLength);

            paragraphsToChoose.forEach((paragraph: ParagraphToChoose, paragraphNo: number): void => {
                const amendmentParagraph = this.motion.amendment_paragraph(paragraphNo);
                if (amendmentParagraph) {
                    this.contentForm.addControl('text_' + paragraphNo, new FormControl(''));
                    contentPatch.selected_paragraphs.push(paragraph);
                    contentPatch['text_' + paragraphNo] = amendmentParagraph;
                }
            });
        }
        return contentPatch;
    }

    /**
     * Retrieves
     */
    private getAllChangingObjectsSorted(): ViewUnifiedChange[] {
        if (!this.sortedChangingObjects) {
            this.sortedChangingObjects = this.motionLineNumbering.recalcUnifiedChanges(
                this.lineLength,
                this.changeRecommendations,
                this.amendments
            );
        }
        return this.sortedChangingObjects;
    }

    private addNewUserToFormCtrl(newUserObj: NewUser, controlName: string): void {
        const control = this.contentForm.get(controlName);
        let currentSubmitters: number[] = control.value;
        if (currentSubmitters?.length) {
            currentSubmitters.push(newUserObj.id);
        } else {
            currentSubmitters = [newUserObj.id];
        }
        control.setValue(currentSubmitters);
    }

    private createNewUser(username: string): Promise<NewUser> {
        return this.userRepo.createFromString(username);
    }

    private subscribeToSettings(): Subscription[] {
        return [
            this.meetingSettingService.get('motions_line_length').subscribe(lineLength => {
                this.lineLength = lineLength;
                this.sortedChangingObjects = null;
            }),
            this.meetingSettingService
                .get('motions_reason_required')
                .subscribe(required => (this.reasonRequired = required)),
            this.meetingSettingService
                .get('motions_supporters_min_amount')
                .subscribe(value => (this.minSupporters = value)),
            this.meetingSettingService.get('motions_preamble').subscribe(value => (this.preamble = value)),
            this.meetingSettingService
                .get('motions_statutes_enabled')
                .subscribe(value => (this.statutesEnabled = value))
        ];
    }

    private subscribeToObservers(): Subscription[] {
        // since updates are usually not commig at the same time, every change to
        // any subject has to mark the view for checking
        if (this.motion) {
            return [
                this.statuteRepo.getViewModelListObservable().subscribe(values => (this.statuteParagraphs = values)),
                this.userRepo.getViewModelListObservable().subscribe(() => this.cd.markForCheck()),
                this.changeRecoRepo.getChangeRecosOfMotionObservable(this.motion.id).subscribe(changeRecos => {
                    if (changeRecos) {
                        this.changeRecommendations = changeRecos;
                        this.sortedChangingObjects = null;
                    }
                }),
                this.repo
                    .getAmendmentsByMotionAsObservable(this.motion.id)
                    .subscribe((amendments: ViewMotion[]): void => {
                        if (amendments) {
                            this.amendments = amendments;
                            this.sortedChangingObjects = null;
                        }
                    })
            ];
        }
        return [];
    }

    private getAllTextChangingObjects(): ViewUnifiedChange[] {
        return this.getAllChangingObjectsSorted().filter((obj: ViewUnifiedChange) => !obj.isTitleChange());
    }

    /**
     * Creates the forms for the Motion and the MotionVersion
     */
    private createForm(): FormGroup {
        const reason: any[] = [''];
        if (this.reasonRequired) {
            reason.push(Validators.required);
        }
        return this.formBuilder.group({
            number: [''],
            title: ['', Validators.required],
            text: ['', Validators.required],
            reason: reason,
            category_id: [],
            attachment_ids: [[]],
            agenda_create: [''],
            agenda_parent_id: [],
            agenda_type: [''],
            submitter_ids: [[]],
            supporter_ids: [[]],
            workflow_id: [],
            tag_ids: [[]],
            origin: [''],
            selected_paragraphs: [],
            statute_amendment: [''], // Internal value for the checkbox, not saved to the model
            statute_paragraph_id: [],
            block_id: [],
            parent_id: [],
            modified_final_version: ['']
        });
    }

    public getDefaultWorkflowKeyOfSettingsByParagraph(paragraph?: number): keyof Settings {
        let configKey: keyof Settings = 'motions_default_workflow_id';
        if (!!this.contentForm && !!this.contentForm.get('statute_amendment').value && !!paragraph) {
            configKey = 'motions_default_statute_amendment_workflow_id';
        } else if (!!this.route.snapshot.queryParams.parent) {
            configKey = 'motions_default_amendment_workflow_id';
        }
        return configKey;
    }

    private getWorkflowIdForCreateFormByParagraph(paragraph?: number): number {
        const configKey = this.getDefaultWorkflowKeyOfSettingsByParagraph(paragraph);
        return +this.meetingSettingService.instant(configKey);
    }
}
