import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { AmendmentParagraphs } from '../../../../../../../../../domain/models/motions/motion';
import { AmendmentControllerService } from '../../../../services/common/amendment-controller.service';
import { MotionControllerService } from '../../../../services/common/motion-controller.service/motion-controller.service';
import {
    MotionLineNumberingService,
    ParagraphToChoose
} from '../../../../services/common/motion-line-numbering.service/motion-line-numbering.service';
import { MotionTinyMceConfig } from '../../definitions/tinymce-config';

@Component({
    selector: `os-amendment-create-wizard`,
    templateUrl: `./amendment-create-wizard.component.html`,
    styleUrls: [`./amendment-create-wizard.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class AmendmentCreateWizardComponent extends BaseMeetingComponent implements OnInit {
    public readonly COLLECTION = ViewMotion.COLLECTION;

    /**
     * The motion to be amended
     */
    public motion!: ViewMotion;

    /**
     * The paragraphs of the base motion
     */
    public paragraphs: ParagraphToChoose[] = [];

    /**
     * Diffed version of the paragraphs, mainly for the preview
     * in case of amendments of amendments
     */
    public diffedParagraphs: ParagraphToChoose[] = [];

    /**
     * determine if we are in the amendment of amendment mode
     */
    private isAmendmentOfAmendment = false;

    /**
     * Change recommendation content.
     */
    public contentForm!: UntypedFormGroup;

    /**
     * Indicates the maximum line length as defined in the configuration.
     */
    private lineLength!: number;

    /**
     * Determine, from the config service, if a reason is required
     */
    public reasonRequired = false;

    /**
     * Indicates if an amendment can change multiple paragraphs or only one
     */
    public multipleParagraphsAllowed = false;

    public tinyMceConfig = MotionTinyMceConfig;

    private _parentMotionId: Id | null = null;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private formBuilder: UntypedFormBuilder,
        private repo: AmendmentControllerService,
        private motionRepo: MotionControllerService,
        private motionLineNumbering: MotionLineNumberingService,
        private route: ActivatedRoute,
        private promptService: PromptService,
        private operator: OperatorService
    ) {
        super();
        this.createForm();
    }

    public ngOnInit(): void {
        this.subscriptions.push(...this.getSubscriptionsToSettings());
    }

    /**
     * Creates the selectable preview of the motion paragraphs, depending
     * on the amendment state
     */
    public getParagraphPreview(index: number): string {
        return this.isAmendmentOfAmendment ? this.diffedParagraphs[index].html : this.paragraphs[index].html;
    }

    /**
     * Cancel the editing.
     * Only fires when the form was dirty
     */
    public async cancelCreation(): Promise<void> {
        if (this.contentForm.dirty || this.contentForm.value.selectedParagraphs.length > 0) {
            const title = this.translate.instant(`Are you sure you want to discard this amendment?`);
            if (await this.promptService.open(title)) {
                this.router.navigate([`..`], { relativeTo: this.route });
            }
        } else {
            this.router.navigate([`..`], { relativeTo: this.route });
        }
    }

    public isParagraphSelected(paragraph: ParagraphToChoose): boolean {
        return !!this.contentForm.value.selectedParagraphs.find(
            (para: ParagraphToChoose) => para.paragraphNo === paragraph.paragraphNo
        );
    }

    /**
     * Function to prevent executing the click event of a checkbox.
     * This prevents that the state of the checkbox is not changed by clicking it.
     *
     * @param event The `MouseEvent`
     */
    public checkboxClicked(event: MouseEvent): void {
        event.preventDefault();
    }

    /**
     * Called by the template when a paragraph is clicked.
     *
     * @param {ParagraphToChoose} paragraph
     */
    public onParagraphClicked(paragraph: ParagraphToChoose): void {
        if (this.multipleParagraphsAllowed) {
            this.toggleParagraph(paragraph);
        } else {
            this.setParagraph(paragraph);
        }
    }

    public onIdFound(id: Id | null): void {
        if (id && !this._parentMotionId) {
            this._parentMotionId = id;
            this.loadMotionByUrl();
        }
    }

    public getSaveAction(): () => Promise<void> {
        return () => this.saveAmendment();
    }

    /**
     * Saves the amendment and navigates to detail view of this amendment
     */
    private async saveAmendment(): Promise<void> {
        const amendmentParagraphs: AmendmentParagraphs = {};
        this.paragraphs.forEach((_: ParagraphToChoose, paraNo: number) => {
            if (
                this.contentForm.value.selectedParagraphs.find((para: ParagraphToChoose) => para.paragraphNo === paraNo)
            ) {
                amendmentParagraphs[paraNo] = this.contentForm.value[`text_` + paraNo];
            }
        });
        const motionCreate = {
            ...this.contentForm.value,
            title: this.translate.instant(`Amendment to`) + ` ` + this.motion.getNumberOrTitle(),
            parent_id: this.motion.id,
            category_id: this.operator.hasPerms(Permission.motionCanManage) ? this.motion.category_id : undefined,
            lead_motion_id: this.motion.id,
            amendment_paragraphs: amendmentParagraphs,
            workflow_id: this.meetingSettingsService.instant(`motions_default_amendment_workflow_id`)
        };

        const { sequential_number } = await this.repo.createParagraphBased(motionCreate);
        this.router.navigate([this.activeMeetingId, `motions`, sequential_number], {
            replaceUrl: true,
            state: { canGoBack: true }
        });
    }

    /**
     * determine the motion to display using the URL
     */
    private loadMotionByUrl(): void {
        // load existing motion
        if (this._parentMotionId) {
            this.subscriptions.push(
                this.motionRepo.getViewModelObservable(this._parentMotionId).subscribe(newViewMotion => {
                    this.initialize(newViewMotion);
                })
            );
        }
    }

    private initialize(motion: ViewMotion | null): void {
        if (!motion) {
            return;
        }
        this.paragraphs = this.motionLineNumbering.getParagraphsToChoose(motion, this.lineLength);

        if (motion.hasLeadMotion) {
            this.isAmendmentOfAmendment = true;
            this.motion = motion.lead_motion!;
            this.diffedParagraphs = this.motionLineNumbering.getDiffedParagraphToChoose(motion, this.lineLength);
        } else {
            this.isAmendmentOfAmendment = false;
            this.motion = motion;
        }
    }

    /**
     * Creates the forms for the Motion and the MotionVersion
     */
    private createForm(): void {
        this.contentForm = this.formBuilder.group({
            selectedParagraphs: [[], Validators.required],
            reason: [``, this.reasonRequired ? Validators.required : []]
        });
    }

    /**
     * Called by the template when a paragraph is clicked in single paragraph mode.
     * Behaves like a radio-button
     *
     * @param {ParagraphToChoose} paragraph
     */
    private setParagraph(paragraph: ParagraphToChoose): void {
        this.contentForm.value.selectedParagraphs.forEach((para: ParagraphToChoose) => {
            this.contentForm.removeControl(`text_` + para.paragraphNo);
        });
        this.contentForm.addControl(`text_` + paragraph.paragraphNo, new UntypedFormControl(paragraph.html));
        this.contentForm.patchValue({
            selectedParagraphs: [paragraph]
        });
    }

    /**
     * Called by the template when a paragraph is clicked in multiple paragraph mode.
     * Behaves like a checkbox
     *
     * @param {ParagraphToChoose} paragraph
     */
    private toggleParagraph(paragraph: ParagraphToChoose): void {
        let newParagraphs: ParagraphToChoose[];
        const oldSelected: ParagraphToChoose[] = this.contentForm.value.selectedParagraphs;
        if (this.isParagraphSelected(paragraph)) {
            newParagraphs = oldSelected.filter(para => para.paragraphNo !== paragraph.paragraphNo);
            this.contentForm.patchValue({
                selectedParagraphs: newParagraphs
            });
            this.contentForm.removeControl(`text_` + paragraph.paragraphNo);
        } else {
            newParagraphs = Object.assign([], oldSelected);
            newParagraphs.push(paragraph);
            newParagraphs.sort(
                (para1: ParagraphToChoose, para2: ParagraphToChoose): number => para1.paragraphNo - para2.paragraphNo
            );

            this.contentForm.addControl(`text_` + paragraph.paragraphNo, new UntypedFormControl(paragraph.html));
            this.contentForm.patchValue({
                selectedParagraphs: newParagraphs
            });
        }
    }

    private getSubscriptionsToSettings(): Subscription[] {
        return [
            this.meetingSettingsService.get(`motions_line_length`).subscribe(lineLength => {
                this.lineLength = lineLength;
                this.loadMotionByUrl();
            }),

            this.meetingSettingsService.get(`motions_reason_required`).subscribe(required => {
                this.reasonRequired = required;
            }),
            this.meetingSettingsService.get(`motions_amendments_multiple_paragraphs`).subscribe(allowed => {
                this.multipleParagraphsAllowed = allowed;
            })
        ];
    }
}
