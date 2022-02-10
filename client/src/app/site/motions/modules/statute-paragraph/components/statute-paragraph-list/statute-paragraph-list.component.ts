import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { MotionStatuteParagraphRepositoryService } from 'app/core/repositories/motions/motion-statute-paragraph-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { MotionStatuteParagraph } from 'app/shared/models/motions/motion-statute-paragraph';
import { largeDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMotionStatuteParagraph } from 'app/site/motions/models/view-motion-statute-paragraph';
import { StatuteCsvExportService } from 'app/site/motions/services/statute-csv-export.service';

/**
 * List view for the statute paragraphs.
 */
@Component({
    selector: `os-statute-paragraph-list`,
    templateUrl: `./statute-paragraph-list.component.html`,
    styleUrls: [`./statute-paragraph-list.component.scss`]
})
export class StatuteParagraphListComponent extends BaseModelContextComponent implements OnInit {
    @ViewChild(`statuteParagraphDialog`, { static: true })
    private statuteParagraphDialog: TemplateRef<string>;

    private dialogRef: MatDialogRef<any>;

    public currentStatuteParagraph: ViewMotionStatuteParagraph | null;

    /**
     * Source of the Data
     */
    public statuteParagraphs: ViewMotionStatuteParagraph[] = [];

    /**
     * Formgroup for creating and updating of statute paragraphs
     */
    public statuteParagraphForm: FormGroup;

    /**
     * The usual component constructor. Initializes the forms
     *
     * @param titleService
     * @param translate
     * @param matSnackBar
     * @param repo
     * @param formBuilder
     * @param promptService
     * @param csvExportService
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private repo: MotionStatuteParagraphRepositoryService,
        private formBuilder: FormBuilder,
        private promptService: PromptService,
        private dialog: MatDialog,
        private csvExportService: StatuteCsvExportService
    ) {
        super(componentServiceCollector, translate);

        const form = {
            title: [``, Validators.required],
            text: [``, Validators.required]
        };
        this.statuteParagraphForm = this.formBuilder.group(form);
    }

    /**
     * Init function.
     *
     * Sets the title and gets/observes statute paragraphs from DataStore
     */
    public ngOnInit(): void {
        super.ngOnInit();
        super.setTitle(`Statute`);
        this.repo.getViewModelListObservable().subscribe(newViewStatuteParagraphs => {
            this.statuteParagraphs = newViewStatuteParagraphs;
        });
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [`motion_statute_paragraph_ids`],
            fieldset: []
        };
    }

    /**
     * Open the modal dialog
     */
    public openDialog(paragraph?: ViewMotionStatuteParagraph): void {
        this.currentStatuteParagraph = paragraph;
        this.statuteParagraphForm.reset();
        if (paragraph) {
            this.statuteParagraphForm.setValue({
                title: paragraph.title,
                text: paragraph.text
            });
        }
        this.dialogRef = this.dialog.open(this.statuteParagraphDialog, largeDialogSettings);
        this.dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.save();
            }
        });
    }

    /**
     * creates a new statute paragraph or updates the current one
     */
    private save(): void {
        if (!this.statuteParagraphForm.valid) {
            return;
        }
        // eiher update or create
        if (this.currentStatuteParagraph) {
            this.updateStatuteParagraph();
        } else {
            this.createStatuteParagraph();
        }
        this.statuteParagraphForm.reset();
    }

    /**
     * Is executed, when the delete button is pressed
     * @param viewStatuteParagraph The statute paragraph to delete
     */
    public async onDeleteButton(viewStatuteParagraph: ViewMotionStatuteParagraph): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this statute paragraph?`);
        const content = viewStatuteParagraph.title;
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(viewStatuteParagraph);
        }
    }

    /**
     * TODO: navigate to a sorting view
     */
    public sortStatuteParagraphs(): void {
        console.log(`Not yet implemented. Depends on other Features`);
    }

    /**
     * clicking Shift and Enter will save automatically
     * clicking Escape will cancel the process
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Enter` && event.shiftKey) {
            this.save();
            this.dialogRef.close();
        }
        if (event.key === `Escape`) {
            this.dialogRef.close();
        }
    }

    /**
     * Triggers a csv export of the statute paragraphs
     */
    public onCsvExport(): void {
        this.csvExportService.exportStatutes(this.statuteParagraphs);
    }

    private async createStatuteParagraph(): Promise<void> {
        const paragraph = new MotionStatuteParagraph(this.statuteParagraphForm.value);
        await this.repo.create(paragraph);
    }

    private async updateStatuteParagraph(): Promise<void> {
        await this.repo.update(
            this.statuteParagraphForm.value as Partial<MotionStatuteParagraph>,
            this.currentStatuteParagraph
        );
    }
}
