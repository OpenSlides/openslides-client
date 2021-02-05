import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AmendmentAction } from 'app/core/actions/amendment-action';
import {
    MotionLineNumberingService,
    ParagraphToChoose
} from 'app/core/repositories/motions/motion-line-numbering.service';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { AmendmentService } from 'app/core/ui-services/amendment.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { AmendmentParagraphs } from 'app/shared/models/motions/motion';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';

/**
 * The wizard used to create a new amendment based on a motion.
 */
@Component({
    selector: 'os-amendment-create-wizard',
    templateUrl: './amendment-create-wizard.component.html',
    styleUrls: ['./amendment-create-wizard.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AmendmentCreateWizardComponent extends BaseComponent implements OnInit {
    /**
     * The motion to be amended
     */
    public motion: ViewMotion;

    /**
     * The paragraphs of the base motion
     */
    public paragraphs: ParagraphToChoose[];

    /**
     * Diffed version of the paragraphs, mainly for the preview
     * in case of amendments of amendments
     */
    public diffedParagraphs: ParagraphToChoose[];

    /**
     * determine if we are in the amendment of amendment mode
     */
    private isAmendmentOfAmendment: boolean;

    /**
     * Change recommendation content.
     */
    public contentForm: FormGroup;

    /**
     * Indicates the maximum line length as defined in the configuration.
     */
    public lineLength: number;

    /**
     * Determine, from the config service, if a reason is required
     */
    public reasonRequired: boolean;

    /**
     * Indicates if an amendment can change multiple paragraphs or only one
     */
    public multipleParagraphsAllowed: boolean;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private meetingSettingsService: MeetingSettingsService,
        private formBuilder: FormBuilder,
        private repo: AmendmentService,
        private motionRepo: MotionRepositoryService,
        private motionLineNumbering: MotionLineNumberingService,
        private route: ActivatedRoute,
        private router: Router,
        private promptService: PromptService
    ) {
        super(componentServiceCollector);
        this.createForm();
    }

    public ngOnInit(): void {
        this.meetingSettingsService.get('motions_line_length').subscribe(lineLength => {
            this.lineLength = lineLength;
            this.getMotionByUrl();
        });

        this.meetingSettingsService.get('motions_reason_required').subscribe(required => {
            this.reasonRequired = required;
        });

        this.meetingSettingsService.get('motions_amendments_multiple_paragraphs').subscribe(allowed => {
            this.multipleParagraphsAllowed = allowed;
        });
    }

    /**
     * determine the motion to display using the URL
     */
    public getMotionByUrl(): void {
        // load existing motion
        this.route.params.subscribe(params => {
            this.motionRepo.getViewModelObservable(params.id).subscribe(newViewMotion => {
                if (newViewMotion) {
                    this.paragraphs = this.motionLineNumbering.getParagraphsToChoose(newViewMotion, this.lineLength);

                    if (newViewMotion.hasLeadMotion) {
                        this.isAmendmentOfAmendment = true;
                        this.motion = newViewMotion.lead_motion;
                        this.diffedParagraphs = this.motionLineNumbering.getDiffedParagraphToChoose(
                            newViewMotion,
                            this.lineLength
                        );
                    } else {
                        this.isAmendmentOfAmendment = false;
                        this.motion = newViewMotion;
                    }
                }
            });
        });
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
            const title = this.translate.instant('Are you sure you want to discard this amendment?');
            if (await this.promptService.open(title)) {
                this.router.navigate(['..'], { relativeTo: this.route });
            }
        } else {
            this.router.navigate(['..'], { relativeTo: this.route });
        }
    }

    /**
     * Creates the forms for the Motion and the MotionVersion
     */
    public createForm(): void {
        this.contentForm = this.formBuilder.group({
            selectedParagraphs: [[], Validators.required],
            reason: ['', Validators.required]
        });
    }

    public isParagraphSelected(paragraph: ParagraphToChoose): boolean {
        return !!this.contentForm.value.selectedParagraphs.find(para => para.paragraphNo === paragraph.paragraphNo);
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
     * Called by the template when a paragraph is clicked in single paragraph mode.
     * Behaves like a radio-button
     *
     * @param {ParagraphToChoose} paragraph
     */
    public setParagraph(paragraph: ParagraphToChoose): void {
        this.contentForm.value.selectedParagraphs.forEach(para => {
            this.contentForm.removeControl('text_' + para.paragraphNo);
        });
        this.contentForm.addControl(
            'text_' + paragraph.paragraphNo,
            new FormControl(paragraph.html, Validators.required)
        );
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
    public toggleParagraph(paragraph: ParagraphToChoose): void {
        let newParagraphs: ParagraphToChoose[];
        const oldSelected: ParagraphToChoose[] = this.contentForm.value.selectedParagraphs;
        if (this.isParagraphSelected(paragraph)) {
            newParagraphs = oldSelected.filter(para => para.paragraphNo !== paragraph.paragraphNo);
            this.contentForm.patchValue({
                selectedParagraphs: newParagraphs
            });
            this.contentForm.removeControl('text_' + paragraph.paragraphNo);
        } else {
            newParagraphs = Object.assign([], oldSelected);
            newParagraphs.push(paragraph);
            newParagraphs.sort((para1: ParagraphToChoose, para2: ParagraphToChoose): number => {
                return para1.paragraphNo - para2.paragraphNo;
            });

            this.contentForm.addControl(
                'text_' + paragraph.paragraphNo,
                new FormControl(paragraph.html, Validators.required)
            );
            this.contentForm.patchValue({
                selectedParagraphs: newParagraphs
            });
        }
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

    /**
     * Saves the amendment and navigates to detail view of this amendment
     */
    public async saveAmendment(): Promise<void> {
        const amendmentParagraphs: AmendmentParagraphs = {};
        this.paragraphs.forEach((paragraph: ParagraphToChoose, paraNo: number) => {
            if (this.contentForm.value.selectedParagraphs.find(para => para.paragraphNo === paraNo)) {
                amendmentParagraphs[paraNo] = this.contentForm.value['text_' + paraNo];
            }
        });
        const motionCreate: AmendmentAction.CreateParagraphbasedPayload = {
            ...this.contentForm.value,
            title: this.translate.instant('Amendment to') + ' ' + this.motion.getNumberOrTitle(),
            parent_id: this.motion.id,
            category_id: this.motion.category_id,
            tag_ids: this.motion.tag_ids,
            motion_block_id: this.motion.block_id,
            lead_motion_id: this.motion.id,
            amendment_paragraphs: amendmentParagraphs,
            workflow_id: this.meetingSettingsService.instant('motions_default_workflow_id')
        };

        const response = await this.repo.createParagraphBased(motionCreate);
        this.router.navigate(['./motions/' + response.id]);
    }
}
