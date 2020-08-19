import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MotionRepositoryService, ParagraphToChoose } from 'app/core/repositories/motions/motion-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { OrganisationSettingsService } from 'app/core/ui-services/organisation-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { BaseComponent } from 'app/site/base/components/base.component';
import { CreateMotion } from 'app/site/motions/models/create-motion';
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

    /**
     * Constructs this component.
     *
     * @param titleService set the browser title
     * @param translate the translation service
     * @param organisationSettingsService The configuration provider
     * @param formBuilder Form builder
     * @param repo Motion Repository
     * @param route The activated route
     * @param router The router
     * @param promptService Show a prompt by leaving the view
     * @param matSnackBar Material Design SnackBar
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private organisationSettingsService: OrganisationSettingsService,
        private formBuilder: FormBuilder,
        private repo: MotionRepositoryService,
        private route: ActivatedRoute,
        private router: Router,
        private promptService: PromptService
    ) {
        super(componentServiceCollector);
        this.createForm();
    }

    public ngOnInit(): void {
        this.organisationSettingsService.get<number>('motions_line_length').subscribe(lineLength => {
            this.lineLength = lineLength;
            this.getMotionByUrl();
        });

        this.organisationSettingsService.get<boolean>('motions_reason_required').subscribe(required => {
            this.reasonRequired = required;
        });

        this.organisationSettingsService.get<boolean>('motions_amendments_multiple_paragraphs').subscribe(allowed => {
            this.multipleParagraphsAllowed = allowed;
        });
    }

    /**
     * determine the motion to display using the URL
     */
    public getMotionByUrl(): void {
        // load existing motion
        this.route.params.subscribe(params => {
            this.repo.getViewModelObservable(params.id).subscribe(newViewMotion => {
                if (newViewMotion) {
                    this.paragraphs = this.repo.getParagraphsToChoose(newViewMotion, this.lineLength);

                    if (newViewMotion.hasLeadMotion) {
                        this.isAmendmentOfAmendment = true;
                        this.motion = newViewMotion.lead_motion;
                        this.diffedParagraphs = this.repo.getDiffedParagraphToChoose(newViewMotion, this.lineLength);
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
                if (para1.paragraphNo < para2.paragraphNo) {
                    return -1;
                } else if (para1.paragraphNo > para2.paragraphNo) {
                    return 1;
                } else {
                    return 0;
                }
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
     *
     * @returns {Promise<void>}
     */
    public async saveAmendment(): Promise<void> {
        console.error('TODO: workflow_id from meetingssettingsservice');
        let text = '';
        const amendedParagraphs = this.paragraphs.map((paragraph: ParagraphToChoose, index: number): string => {
            if (this.contentForm.value.selectedParagraphs.find(para => para.paragraphNo === index)) {
                text = this.contentForm.value['text_' + index];
                return this.contentForm.value['text_' + index];
            } else {
                return null;
            }
        });
        throw new Error('TODO');
        /*const newMotionValues = {
            ...this.contentForm.value,
            title: this.translate.instant('Amendment to') + ' ' + this.motion.getNumberOrTitle(),
            text: text, // Workaround as 'text' is required from the backend
            parent_id: this.motion.id,
            category_id: this.motion.category_id,
            tag_ids: this.motion.tag_ids,
            motion_block_id: this.motion.block_id,
            amendment_paragraphs: amendedParagraphs,
            // TODO
            // workflow_id: this.configService.instant<number>('motions_amendments_workflow')
        };

        const motion = new CreateMotion();
        motion.deserialize(newMotionValues);

        const response = await this.repo.create(motion);
        this.router.navigate(['./motions/' + response.id]);*/
    }
}
