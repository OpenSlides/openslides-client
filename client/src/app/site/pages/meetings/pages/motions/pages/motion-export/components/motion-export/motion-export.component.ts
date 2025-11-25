import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipOption, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabChangeEvent, MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { Settings } from 'src/app/domain/models/meetings/meeting';
import { ChangeRecoMode, LineNumberingMode, PERSONAL_NOTE_ID } from 'src/app/domain/models/motions/motions.constants';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseComponent } from 'src/app/site/base/base.component';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ViewMotion, ViewMotionCommentSection } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { MotionCommentSectionControllerService } from '../../../../modules/comments/services/motion-comment-section-controller.service';
import { getMotionDetailSubscriptionConfig } from '../../../../motions.subscription';
import { AmendmentControllerService } from '../../../../services/common/amendment-controller.service';
import { MotionLineNumberingService } from '../../../../services/common/motion-line-numbering.service';
import {
    ExportFileFormat,
    InfoToExport,
    motionImportExportHeaderOrder,
    noMetaData
} from '../../../../services/export/definitions';
import { MotionExportInfo, MotionExportService } from '../../../../services/export/motion-export.service';

interface SavedSelections {
    tab_index: number;
    tab_selections: object[];
}

@Component({
    standalone: true,
    selector: `os-motion-export`,
    templateUrl: `./motion-export.component.html`,
    styleUrls: [`./motion-export.component.scss`],
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonToggleModule,
        MatBadgeModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatTabsModule,
        DirectivesModule,
        HeadBarModule,
        OpenSlidesTranslationModule
    ]
})
export class MotionExportComponent extends BaseComponent implements AfterViewInit, OnDestroy {
    private readonly route = inject(ActivatedRoute);

    /**
     * import PERSONAL_NOTE_ID for use in template
     */
    public PERSONAL_NOTE_ID = PERSONAL_NOTE_ID;

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
     * The form that contains the export information in the shape needed
     * for the view.
     */
    public dialogForm!: UntypedFormGroup;

    public workingGroupSpeakerActive: boolean;

    /**
     * The default pdf export values in contrast to the restored values
     */
    private pdfDefaults = {
        format: ExportFileFormat.PDF,
        lnMode: this.lnMode.Outside,
        crMode: this.crMode.Diff,
        content: [`title`, `number`, `text`, `reason`, `sequential_number`],
        metaInfo: [`state`, `recommendation`, `category`, `tags`, `block`, `polls`, `referring_motions`],
        personrelated: [`submitters`, `supporters`, `editors`, `working_group_speakers`],
        pageLayout: [`toc`, `addBreaks`],
        headerFooter: [`header`, `page`],
        comments: []
    };

    /**
     * The default csv export values in contrast to the restored values
     */
    private csvDefaults = {
        format: ExportFileFormat.CSV,
        lnMode: [],
        crMode: this.crMode.Original,
        content: [`title`, `number`, `text`, `reason`, `sequential_number`],
        metaInfo: [`state`, `recommendation`, `category`, `tags`, `block`, `referring_motions`, `speakers`],
        personrelated: [`submitters`, `supporters`, `editors`, `working_group_speakers`],
        pageLayout: [],
        headerFooter: [],
        comments: []
    };

    /**
     * The default xlsx export values in contrast to the restored values
     */
    private xlsxDefaults = {
        format: ExportFileFormat.XLSX,
        lnMode: [],
        crMode: [],
        content: [`title`, `number`, `sequential_number`],
        metaInfo: [`state`, `recommendation`, `category`, `tags`, `block`, `referring_motions`, `speakers`],
        personrelated: [`submitters`, `supporters`, `editors`, `working_group_speakers`],
        pageLayout: [],
        headerFooter: [],
        comments: []
    };

    // Store fileformats with corresponding tab group index
    private fileFormats: ExportFileFormat[] = [ExportFileFormat.PDF, ExportFileFormat.CSV, ExportFileFormat.XLSX];

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
     * Store the subject to the ViewMotionCommentSection
     */
    private commentsSubject: Observable<ViewMotionCommentSection[]>;

    @ViewChild(`tabGroup`)
    public tabGroup!: MatTabGroup;

    @ViewChild(`editorsChipOption`)
    public editorsChipOption!: MatChipOption;

    @ViewChild(`recommendationChipOption`)
    public recommendationChipOption!: MatChipOption;

    @ViewChild(`categoryChipOption`)
    public categoryChipOption!: MatChipOption;

    @ViewChild(`tagChipOption`)
    public tagChipOption!: MatChipOption;

    @ViewChild(`blockChipOption`)
    public blockChipOption!: MatChipOption;

    @ViewChild(`continuousText`)
    public continuousTextChipOption!: MatChipOption;

    @ViewChild(`spokespersonChip`)
    public spokespersonChip!: MatChipOption;

    @ViewChild(`referringMotionsChip`)
    public referringMotionsChip!: MatChipOption;

    @ViewChild(`tableOfContentChip`)
    public tableOfContentChip!: MatChipOption;

    @ViewChild(`addBreaksChip`)
    public addBreaksChip!: MatChipOption;

    @ViewChild(`supportersChip`)
    public supportersChip!: MatChipOption;

    @ViewChild(`textChip`)
    public textChip!: MatChipOption;

    public isCSVExport = false;
    public isXLSXExport = false;

    public motionsNr = 0;

    public motions: number[];
    private motions_models: ViewMotion[];

    public disabledControls: string[] = [];

    public override componentServiceCollector = inject(MeetingComponentServiceCollectorService);
    protected override translate = inject(TranslateService);

    protected get meetingSettingsService(): MeetingSettingsService {
        return this.componentServiceCollector.meetingSettingsService;
    }

    private repoSub: Subscription;

    private savedSelections: SavedSelections = {
        tab_index: 0,
        tab_selections: [this.pdfDefaults, this.csvDefaults, this.xlsxDefaults]
    };

    /**
     * Constructor
     * Sets the default values for the lineNumberingMode and changeRecoMode and creates the form.
     * This uses "instant" over observables to prevent on-fly-changes by auto update while
     * the dialog is open.
     */
    public constructor(
        public formBuilder: UntypedFormBuilder,
        public commentRepo: MotionCommentSectionControllerService,
        private motionRepo: MotionRepositoryService,
        private exportService: MotionExportService,
        private amendmentRepo: AmendmentControllerService,
        private motionLineNumbering: MotionLineNumberingService,
        private storeService: StorageService
    ) {
        super();
        this.subscriptions.push(
            this.route.queryParamMap.subscribe(paramMap => {
                this.motions = paramMap.getAll(`motions`).map(value => Number(value));
            })
        );
        // wait either for all viewmodels of motions to be loaded or for the view
        this.repoSub = this.motionRepo.getViewModelListObservable().subscribe(_ => {
            this.motions_models = this.motions.map(motion => this.motionRepo.getViewModel(motion));
            this.createForm().then(_ => {
                if (!this.motions_models.includes(null)) {
                    // check available keywords and settings
                    this.hasAvailableVariables();
                    // disable pageLayout if only one motion is selected
                    if (this.motionsNr === 1) {
                        this.disableControl(`pageLayout`);
                    }
                }
            });
        });
        this.motionsNr = this.motions.length;
        this.workingGroupSpeakerActive = this.meetingSettingsService.instant(`motions_enable_working_group_speaker`)!;
        this.commentsSubject = this.commentRepo.getViewModelListObservable();
        // Get the export order, exclude everything that does not count as meta-data
        this.metaInfoExportOrder = motionImportExportHeaderOrder.filter(
            metaData => !noMetaData.some(noMeta => metaData === noMeta)
        );
    }

    public ngAfterViewInit(): void {
        if (!this.motions_models.includes(null)) {
            this.hasAvailableVariables();
        }
    }

    public override ngOnDestroy(): void {
        this.savedSelections.tab_selections.splice(this.dialogForm.value.format - 1, 1, this.dialogForm.value);
        this.storeService.set(`motion-export-selection`, this.savedSelections);
        super.ngOnDestroy();
    }

    // React to changes on the file format
    public tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
        this.savedSelections.tab_selections.splice(this.dialogForm.value.format - 1, 1, this.dialogForm.value);
        this.isCSVExport = this.fileFormats[tabChangeEvent.index] === ExportFileFormat.CSV;
        this.isXLSXExport = this.fileFormats[tabChangeEvent.index] === ExportFileFormat.XLSX;
    };

    public afterTabChanged(): void {
        if (this.isCSVExport) {
            this.dialogForm.patchValue(this.savedSelections.tab_selections[1]);
        } else if (this.isXLSXExport) {
            this.dialogForm.patchValue(this.savedSelections.tab_selections[2]);
        } else {
            this.dialogForm.patchValue(this.savedSelections.tab_selections[0]);
        }

        if (!this.motions_models.includes(null)) {
            this.hasAvailableVariables();
        }
    }

    /**
     * Creates the form with default values
     */
    public async createForm(): Promise<void> {
        if (this.dialogForm) {
            return;
        }
        this.dialogForm = this.formBuilder.group({
            format: [],
            lnMode: [],
            crMode: [],
            content: [],
            metaInfo: [],
            personrelated: [],
            pageLayout: [],
            headerFooter: [],
            comments: []
        });
        this.dialogForm.patchValue(this.pdfDefaults);
        this.dialogForm.controls[`crMode`].valueChanges.subscribe(value => {
            if (!value) {
                this.deselectOption(`content`, `text`);
                this.changeStateOfChipOption(this.textChip, true, `text`);
            } else {
                if (!this.dialogForm.get(`content`).value.includes('text')) {
                    this.dialogForm.get(`content`).setValue([...this.dialogForm.get(`content`).value, ...[`text`]]);
                }
                this.changeStateOfChipOption(this.textChip, false, `text`);
            }
        });
        this.storeService.get<SavedSelections>(`motion-export-selection`).then(savedDefaults => {
            if (savedDefaults?.tab_index !== undefined) {
                this.savedSelections = savedDefaults;
            } else {
                const defaultLineNumbering = this.meetingSettingsService.instant(`motions_default_line_numbering`);
                const defaultTextVersion = this.meetingSettingsService.instant(`motions_recommendation_text_mode`);
                if ([this.lnMode.None, this.lnMode.Outside].includes(defaultLineNumbering)) {
                    (this.savedSelections.tab_selections[0] as any).lnMode = defaultLineNumbering;
                }
                (this.savedSelections.tab_selections[0] as any).crMode = defaultTextVersion;
                if ([this.crMode.Original, this.crMode.Final].includes(defaultTextVersion)) {
                    (this.savedSelections.tab_selections[1] as any).crMode = defaultTextVersion;
                }
            }
            this.tabGroup.selectedIndex = this.savedSelections.tab_index;
            this.dialogForm.patchValue(this.savedSelections.tab_selections[this.savedSelections.tab_index]);
        });
    }

    // Function to determine whioch options are available, set as defaults and disabled
    // (based on property binding with the formgroup)
    private hasAvailableVariables(): void {
        // Check for meetingSettings if options should be visible
        this.filterFormControlDefaults(`content`, `motions_show_sequential_number`, `sequential_number`);
        this.filterFormControlDefaults(`personrelated`, `motions_enable_working_group_speaker`);
        if (!this.meetingSettingsService.instant(`motions_show_referring_motions`)) {
            this.filterFormControlDefaults(`metaInfo`, `motions_show_referring_motions`, `referring_motions`);
            this.changeStateOfChipOption(this.referringMotionsChip, true, `referring_motions`);
        }
        if (!this.meetingSettingsService.instant(`motions_enable_editor`)) {
            this.filterFormControlDefaults(`personrelated`, `motions_enable_editor`, `editors`);
            this.changeStateOfChipOption(this.editorsChipOption, true, `editors`);
        }
        if (!this.meetingSettingsService.instant(`motions_recommendations_by`)) {
            this.filterFormControlDefaults(`metaInfo`, `motions_recommendations_by`, `recommendation`);
            this.changeStateOfChipOption(this.recommendationChipOption, true, `recommendation`);
        }
        if (this.meetingSettingsService.instant(`motions_supporters_min_amount`) === 0) {
            this.filterFormControlDefaults(`personrelated`, `motions_supporters_min_amount`, `supporters`);
            this.changeStateOfChipOption(this.supportersChip, true, `supporters`);
        }
        if (!this.meetingSettingsService.instant(`motions_enable_working_group_speaker`)) {
            this.filterFormControlDefaults(
                `personrelated`,
                `motions_enable_working_group_speaker`,
                `working_group_speakers`
            );
            this.changeStateOfChipOption(this.spokespersonChip, true, `working_group_speakers`);
        }

        // Check for available information in selected motions, else disable option
        this.filterFormControlAvailableValues(`personrelated`, `editors`, this.editorsChipOption);
        this.filterFormControlAvailableValues(`personrelated`, `working_group_speakers`, this.spokespersonChip);
        this.filterFormControlAvailableValues(`metaInfo`, `category`, this.categoryChipOption);
        this.filterFormControlAvailableValues(`metaInfo`, `block`, this.blockChipOption);
        this.filterFormControlAvailableValues(`metaInfo`, `recommendation`, this.recommendationChipOption);
        if (
            this.motions_models.filter(m =>
                m[`referenced_in_motion_recommendation_extensions`] === null ||
                m[`referenced_in_motion_recommendation_extensions`]?.length === 0
                    ? false
                    : m[`referenced_in_motion_recommendation_extensions`]
            ).length === 0
        ) {
            this.deselectOption(`metaInfo`, `referring_motions`);
            this.changeStateOfChipOption(this.referringMotionsChip, true, `referring_motions`);
        }
        if (this.motions_models.filter(m => (m ? m.hasTags() : false)).length === 0) {
            this.deselectOption(`metaInfo`, `tags`);
            this.changeStateOfChipOption(this.tagChipOption, true, `tags`);
        }
    }

    /**
     * Function to change the state of the property `disabled` of a given ChipOption.
     *
     * Ensures, that the ChipOption exists.
     *
     * @param chipOption The ChipOption whose state will change.
     * @param nextState The next state the ChipOption will assume.
     */
    private changeStateOfChipOption(chipOption: MatChipOption, nextState: boolean, value: string): void {
        if (chipOption) {
            chipOption.disabled = nextState;
            if (nextState) {
                this.disabledControls.push(value);
                chipOption.selected = false;
            } else {
                this.disabledControls = this.disabledControls.filter(obj => !obj.includes(value));
            }
        }
    }

    /**
     * Helper function to easier disable a control
     *
     * @param name
     */
    private disableControl(name: string): void {
        this.dialogForm.get(name)!.disable();
        this.dialogForm.get(name)!.setValue(this.getOffState(name));
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

    public deselectPageLayoutOption(): void {
        if (this.continuousTextChipOption.selected) {
            this.deselectOption(`pageLayout`, `toc`);
            this.deselectOption(`pageLayout`, `addBreaks`);
        }
        if (this.tableOfContentChip.selected || this.addBreaksChip.selected) {
            this.deselectOption(`pageLayout`, `continuousText`);
        }
    }

    public deselectContinuousTextOption(): void {
        if (this.tableOfContentChip.selected || this.addBreaksChip.selected) {
            this.deselectOption(`pageLayout`, `continuousText`);
        }
    }

    // Helper function to exclude option from formcontrol and deselect it
    private deselectOption(formGroup: string, value: string): void {
        this.dialogForm
            .get(formGroup)
            .setValue(this.dialogForm.get(formGroup).value?.filter(obj => !obj.includes(value)));
    }

    // Helper function to determine if mat-chip-option should be selected
    // Needed, because using the binding with formControl does not disable mat-chip-option
    public isDisabled(value: string): boolean {
        return this.disabledControls.includes(value);
    }

    // Helper function to filter form control values as set as default based on the meeting settings
    public filterFormControlDefaults(formControl: string, setting: keyof Settings, value?: string): void {
        value = value ? value : setting.toString();
        this.dialogForm
            .get(formControl)
            .setValue(
                !this.meetingSettingsService.instant(setting)
                    ? this.dialogForm.get(formControl).value?.filter(obj => !obj.includes(value))
                    : this.dialogForm.get(formControl).value
            );
    }

    // Helper function to filter and disable form control values based on availability of the properties
    // in the chosen motions
    public filterFormControlAvailableValues(formControl: string, val: string, chipOption: MatChipOption): void {
        if (this.motions_models.filter(m => (m[val] === null || m[val]?.length === 0 ? false : m[val])).length === 0) {
            this.deselectOption(formControl, val);
            this.changeStateOfChipOption(chipOption, true, val);
        }
    }

    // Transform form of motion export to MotionExportInfo for further processing
    public dialogToExportInfo(dialogForm: UntypedFormGroup): MotionExportInfo {
        const exportInfo = {};

        exportInfo[`format`] = dialogForm.value[`format`] as ExportFileFormat;
        exportInfo[`crMode`] = dialogForm.get(`crMode`).value as ChangeRecoMode;
        exportInfo[`lnMode`] = dialogForm.get(`lnMode`).value as LineNumberingMode;
        exportInfo[`comments`] = dialogForm.get(`comments`).value;
        exportInfo[`content`] = dialogForm.get(`content`).value.filter(obj => !obj.includes(`id`));

        let intersection = [
            `submitters`,
            `supporters`,
            `state`,
            `recommendation`,
            `category`,
            `block`,
            `tags`,
            `polls`,
            `speakers`,
            `sequential_number`,
            `referring_motions`,
            `allcomments`,
            `editors`,
            `working_group_speakers`
        ].filter(
            element =>
                dialogForm.get(`metaInfo`).value?.includes(element) ||
                dialogForm.get(`content`).value?.includes(element) ||
                dialogForm.get(`personrelated`).value?.includes(element)
        );
        exportInfo[`metaInfo`] = intersection as InfoToExport[];

        intersection = [
            `toc`,
            `header`,
            `page`,
            `date`,
            `attachments`,
            `addBreaks`,
            `continuousText`,
            `onlyChangedLines`
        ].filter(
            element =>
                dialogForm.get(`pageLayout`).value?.includes(element) ||
                dialogForm.get(`headerFooter`).value?.includes(element) ||
                dialogForm.get(`content`).value?.includes(element)
        );
        exportInfo[`pdfOptions`] = intersection;

        return exportInfo;
    }

    public async exportMotions(): Promise<void> {
        this.repoSub.unsubscribe();
        const motions_models = this.motions.map(motion => this.motionRepo.getViewModel(motion));
        const exportInfo = this.dialogToExportInfo(this.dialogForm);
        if (exportInfo) {
            if (motions_models.length) {
                await this.modelRequestService.fetch(
                    getMotionDetailSubscriptionConfig(...motions_models.map(m => m.id))
                );
            }
            const amendments = this.amendmentRepo.getViewModelList();
            this.motionLineNumbering.resetAmendmentChangeRecoListeners(amendments);

            this.exportService.evaluateExportRequest(
                exportInfo,
                motions_models.map(m => this.motionRepo.getViewModel(m.id))
            );
        }
        this.router.navigate([`..`], { relativeTo: this.route });
    }

    public cancelExport(): void {
        this.router.navigate([`..`], { relativeTo: this.route });
    }
}
