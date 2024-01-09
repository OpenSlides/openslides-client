import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { MotionStatuteParagraph } from 'src/app/domain/models/motions/motion-statute-paragraph';
import { largeDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ViewMotionStatuteParagraph } from 'src/app/site/pages/meetings/pages/motions';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { MotionStatuteParagraphControllerService } from '../../../../modules/statute-paragraphs/services';
import { StatuteParagraphCsvExportService } from '../../services/statute-paragraph-csv-export.service';

@Component({
    selector: `os-statute-paragraph-list`,
    templateUrl: `./statute-paragraph-list.component.html`,
    styleUrls: [`./statute-paragraph-list.component.scss`]
})
export class StatuteParagraphListComponent extends BaseComponent implements OnInit {
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
    public statuteParagraphForm: UntypedFormGroup;

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private repo: MotionStatuteParagraphControllerService,
        private formBuilder: UntypedFormBuilder,
        private promptService: PromptService,
        private dialog: MatDialog,
        private csvExportService: StatuteParagraphCsvExportService
    ) {
        super();

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
        super.setTitle(`Statute`);
        this.repo.getViewModelListObservable().subscribe(newViewStatuteParagraphs => {
            this.statuteParagraphs = newViewStatuteParagraphs;
        });
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
        const title = _(`Are you sure you want to delete this statute paragraph?`);
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
