import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatButtonToggle, MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialogRef } from '@angular/material/dialog';
import { auditTime, Observable } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import {
    ChangeRecoMode,
    LineNumberingMode,
    MOTION_PDF_OPTIONS,
    PERSONAL_NOTE_ID
} from 'src/app/domain/models/motions/motions.constants';
import { StorageService } from 'src/app/gateways/storage.service';
import { ViewMotionCommentSection } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { MotionCommentSectionControllerService } from '../../../../modules/comments/services/motion-comment-section-controller.service';
import { ExportFileFormat, motionImportExportHeaderOrder, noMetaData } from '../../../../services/export/definitions';
import { MotionExportInfo } from '../../../../services/export/motion-export.service/motion-export.service';

@Component({
    selector: `os-motion-export-dialog`,
    templateUrl: `./motion-export-dialog.component.html`,
    styleUrls: [`./motion-export-dialog.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class MotionExportDialogComponent extends BaseUiComponent implements OnInit {
    /**
     * import PERSONAL_NOTE_ID for use in template
     */
    public PERSONAL_NOTE_ID = PERSONAL_NOTE_ID;

    public readonly permission = Permission;

    /**
     * For using the enum constants from the template.
     */
    public lnMode = LineNumberingMode;

    /**
     * For using the enum constants from the template.
     */
    public crMode = ChangeRecoMode;

    /**
     * to use the format in the template
     */
    public fileFormat = ExportFileFormat;

    /**
     * The form that contains the export information.
     */
    public exportForm!: UntypedFormGroup;

    /**
     * Store the subject to the ViewMotionCommentSection
     */
    private commentsSubject: Observable<ViewMotionCommentSection[]>;

    /**
     * The default export values in contrast to the restored values
     */
    private defaults: MotionExportInfo = {
        format: ExportFileFormat.PDF,
        content: [`text`, `reason`],
        pdfOptions: [
            MOTION_PDF_OPTIONS.Toc,
            MOTION_PDF_OPTIONS.Header,
            MOTION_PDF_OPTIONS.Page,
            MOTION_PDF_OPTIONS.AddBreaks
        ],
        metaInfo: [`submitters`, `state`, `recommendation`, `category`, `tags`, `block`, `polls`]
    };

    /**
     * Determine the export order of the meta data
     */
    public metaInfoExportOrder: string[];

    /**
     * @returns a list of available commentSections
     */
    public get commentsToExport(): ViewMotionCommentSection[] {
        return this.commentRepo.getViewModelList();
    }

    /**
     * To deactivate the export-as-diff button
     */
    @ViewChild(`diffVersionButton`, { static: true })
    public diffVersionButton!: MatButtonToggle;

    /**
     * To deactivate the voting result button
     */
    @ViewChild(`votingResultButton`, { static: true })
    public votingResultButton!: MatButtonToggle;

    /**
     * To deactivate the speakers button.
     */
    @ViewChild(`speakersButton`)
    public speakersButton!: MatButtonToggle;

    /**
     * To deactivate the toc button.
     */
    @ViewChild(MOTION_PDF_OPTIONS.Toc)
    public tocButton!: MatButtonToggle;

    @ViewChild(MOTION_PDF_OPTIONS.AddBreaks)
    public addBreaksButton!: MatButtonToggle;

    @ViewChild(MOTION_PDF_OPTIONS.ContinuousText)
    public continuousTextButton!: MatButtonToggle;

    /**
     * Constructor
     * Sets the default values for the lineNumberingMode and changeRecoMode and creates the form.
     * This uses "instant" over observables to prevent on-fly-changes by auto update while
     * the dialog is open.
     */
    public constructor(
        public formBuilder: UntypedFormBuilder,
        public dialogRef: MatDialogRef<MotionExportDialogComponent>,
        public meetingSettingsService: MeetingSettingsService,
        public commentRepo: MotionCommentSectionControllerService,
        private store: StorageService
    ) {
        super();
        this.defaults.lnMode = this.meetingSettingsService.instant(`motions_default_line_numbering`)!;
        this.defaults.crMode = this.meetingSettingsService.instant(`motions_recommendation_text_mode`)!;
        this.commentsSubject = this.commentRepo.getViewModelListObservable();
        if (this.meetingSettingsService.instant(`motions_show_sequential_number`)) {
            this.defaults.metaInfo!.push(`id`);
        }
        // Get the export order, exclude everything that does not count as meta-data
        this.metaInfoExportOrder = motionImportExportHeaderOrder.filter(
            metaData => !noMetaData.some(noMeta => metaData === noMeta)
        );
        this.createForm();
    }

    /**
     * Init.
     * Observes the form for changes to react dynamically
     */
    public ngOnInit(): void {
        this.subscriptions.push(
            this.exportForm.valueChanges.pipe(auditTime(500)).subscribe((value: MotionExportInfo) => {
                this.store.set(`motion_export_selection`, value);
            }),

            this.exportForm
                .get(`format`)!
                .valueChanges.subscribe((value: ExportFileFormat) => this.onFormatChange(value))
        );
    }

    /**
     * React to changes on the file format
     * @param format
     */
    private onFormatChange(format: ExportFileFormat): void {
        // XLSX cannot have "content"
        if (format === ExportFileFormat.XLSX) {
            this.disableControl(`content`);
            this.changeStateOfButton(this.speakersButton, false);
        } else {
            this.enableControl(`content`);
            this.changeStateOfButton(this.speakersButton, true);
        }

        if (format === ExportFileFormat.CSV || format === ExportFileFormat.XLSX) {
            this.disableControl(`lnMode`);
            this.disableControl(`crMode`);
            this.disableControl(`pdfOptions`);

            // remove the selection of "votingResult"
            if (format === ExportFileFormat.CSV) {
                this.disableMetaInfoControl(`polls`, `speakers`);
            } else {
                this.disableMetaInfoControl(`polls`);
            }
            this.votingResultButton.disabled = true;
        }

        if (format === ExportFileFormat.PDF) {
            this.enableControl(`lnMode`);
            this.enableControl(`crMode`);
            this.enableControl(`pdfOptions`);
            this.votingResultButton.disabled = false;
        }
    }

    public onChange(event: MatButtonToggleChange): void {
        if (event.value.includes(MOTION_PDF_OPTIONS.ContinuousText)) {
            this.tocButton.checked = false;
            this.addBreaksButton.checked = false;
        }
    }

    /**
     * Function to change the state of the property `disabled` of a given button.
     *
     * Ensures, that the button exists.
     *
     * @param button The button whose state will change.
     * @param nextState The next state the button will assume.
     */
    private changeStateOfButton(button: MatButtonToggle, nextState: boolean): void {
        if (button) {
            button.disabled = nextState;
        }
    }

    /**
     * Helper function to easier enable a control
     * @param name
     */
    private enableControl(name: string): void {
        this.exportForm.get(name)!.enable();
    }

    /**
     * Helper function to easier disable a control
     *
     * @param name
     */
    private disableControl(name: string): void {
        this.exportForm.get(name)!.disable();
        this.exportForm.get(name)!.setValue(this.getOffState(name));
    }

    /**
     * Determine what "off means in certain states"
     *
     * @param control
     */
    private getOffState(control: string): string | null {
        switch (control) {
            case `lnMode`:
                return this.lnMode.None;
            case `crMode`:
                return this.crMode.Original;
            default:
                return null;
        }
    }

    /**
     * Function to deactivate at least one field of the meta-info.
     *
     * @param fields All fields to deactivate.
     */
    private disableMetaInfoControl(...fields: string[]): void {
        let metaInfoVal: string[] = this.exportForm.get(`metaInfo`)!.value;
        if (metaInfoVal) {
            metaInfoVal = metaInfoVal.filter(info => !fields.includes(info));
            this.exportForm.get(`metaInfo`)!.setValue(metaInfoVal);
        }
    }

    /**
     * Creates the form with default values
     */
    public createForm(): void {
        this.exportForm = this.formBuilder.group({
            format: [],
            lnMode: [],
            crMode: [],
            content: [],
            metaInfo: [],
            pdfOptions: [],
            comments: []
        });

        // restore selection or set default
        this.store.get<MotionExportInfo>(`motion_export_selection`).then(restored => {
            if (restored) {
                this.exportForm.patchValue(restored);
            } else {
                this.exportForm.patchValue(this.defaults);
            }
        });
    }

    /**
     * Just close the dialog
     */
    public onCloseClick(): void {
        this.dialogRef.close();
    }

    /**
     * Gets the untranslated label for metaData
     */
    public getLabelForMetadata(metaDataName: string): string {
        switch (metaDataName) {
            case `polls`: {
                return `Voting result`;
            }
            case `id`: {
                return `Sequential number`;
            }
            case `block`: {
                return `Motion block`;
            }
            default: {
                return metaDataName.charAt(0).toUpperCase() + metaDataName.slice(1);
            }
        }
    }
}
