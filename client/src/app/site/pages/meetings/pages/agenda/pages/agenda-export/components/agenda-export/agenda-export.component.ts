import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipOption, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { Id } from 'src/app/domain/definitions/key-types';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseComponent } from 'src/app/site/base/base.component';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import {
    AGENDA_LIST_ITEM_SUBSCRIPTION,
    getAgendaExportSubscriptionConfig,
    getAgendaExportTreeSubscriptionConfig
} from '../../../../agenda.subscription';
import { AgendaItemControllerService } from '../../../../services/agenda-item-controller.service/agenda-item-controller.service';
import { AgendaItemListModule } from '../../../agenda-item-list/agenda-item-list.module';
import {
    AgendaItemExportService,
    ExportFileFormat
} from '../../../agenda-item-list/services/agenda-item-export.service/agenda-item-export.service';

interface SavedSelections {
    tab_index: number;
    tab_selections: object[];
}
@Component({
    selector: `os-agenda-export`,
    templateUrl: `./agenda-export.component.html`,
    styleUrl: `./agenda-export.component.scss`,
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
        OpenSlidesTranslationModule,
        AgendaItemListModule
    ]
})
export class AgendaExportComponent extends BaseComponent implements OnDestroy, AfterViewInit {
    public dialogForm!: UntypedFormGroup;

    @ViewChild(`tabGroup`)
    public tabGroup!: MatTabGroup;

    @ViewChild(`itemNumberChip`)
    public itemNumberChip!: MatChipOption;

    @ViewChild(`textChip`)
    public textChip!: MatChipOption;

    @ViewChild(`attachmentsChip`)
    public attachmentsChip!: MatChipOption;

    @ViewChild(`moderationNotesChip`)
    public moderationNotesChip!: MatChipOption;

    @ViewChild(`listOfSpeakersChip`)
    public listOfSpeakersChip!: MatChipOption;

    @ViewChild(`pollsChip`)
    public pollsChip!: MatChipOption;

    @ViewChild(`internalCommentaryChip`)
    public internalCommentaryChip!: MatChipOption;

    public disabledControls: string[] = [];

    public get isPDFFormat(): boolean {
        return this.fileFormats[this.tabIndex] === ExportFileFormat.PDF;
    }

    public get isCSVFormat(): boolean {
        return this.fileFormats[this.tabIndex] === ExportFileFormat.CSV;
    }

    public agendaItems: Id[] = [];

    private pdfDefaults = {
        content: [`item_number`, `title`, `text`, `attachments`, `moderation_notes`],
        pageLayout: [],
        footerHeader: []
    };

    private csvDefaults = {
        content: [`item_number`, `title`, `text`, `attachments`, `moderation_notes`],
        metaInfo: [`duration`]
    };

    private tabIndex = 0;
    // Store fileformats with corresponding tab group index
    private fileFormats: ExportFileFormat[] = [ExportFileFormat.PDF, ExportFileFormat.CSV];
    private savedSelections: SavedSelections = {
        tab_index: 0,
        tab_selections: [this.pdfDefaults, this.csvDefaults]
    };

    private backNr: string;

    public constructor(
        private route: ActivatedRoute,
        private formBuilder: UntypedFormBuilder,
        private storeService: StorageService,
        private agendaRepo: AgendaItemControllerService,
        private agendaExportService: AgendaItemExportService,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {
        super();
        this.subscriptions.push(
            this.route.queryParamMap.subscribe(paramMap => {
                this.agendaItems = paramMap.getAll(`agenda-items`).map(value => Number(value));
                this.backNr = paramMap.get(`back`);
            })
        );
        this.initForm();
    }

    public ngAfterViewInit(): void {
        if (!this.agendaItems.includes(null)) {
            this.updateAvailableExportOptions();
        }
    }

    public override ngOnDestroy(): void {
        this.savedSelections.tab_selections.splice(this.tabIndex, 1, this.dialogForm.value);
        this.storeService.set(`agenda-export-selection`, this.savedSelections);
        super.ngOnDestroy();
    }

    public cancelExport(): void {
        if (this.backNr) {
            this.router.navigate([this.activeMeetingIdService.meetingId, `agenda`, `topics`, this.backNr]);
        } else {
            this.router.navigate([`..`], { relativeTo: this.route });
        }
    }

    public async exportAgenda(): Promise<void> {
        await this.modelRequestService.fetch(getAgendaExportSubscriptionConfig(...this.agendaItems));
        await this.modelRequestService.fetch(
            getAgendaExportTreeSubscriptionConfig(this.activeMeetingIdService.meetingId)
        );
        const views = this.agendaItems.map(id => this.agendaRepo.getViewModel(id));
        const info = this.dialogForm.get(`content`).value ?? [];
        if (this.isPDFFormat) {
            const pdfMeta = [
                ...((this.dialogForm.get(`pageLayout`).value as string[]) ?? []),
                ...(this.dialogForm.get(`headerFooter`).value ?? [])
            ];
            this.agendaExportService.exportAsPdf(views, info, pdfMeta);
        } else if (this.isCSVFormat) {
            const csvMetaInfo = this.dialogForm.get(`metaInfo`).value ?? [];
            this.agendaExportService.exportAsCsv(views, info, csvMetaInfo);
        }
        this.router.navigate([this.activeMeetingIdService.meetingId, `agenda`]);
    }

    public afterTabChanged(): void {
        this.dialogForm.patchValue(this.savedSelections.tab_selections[this.tabIndex]);
    }

    public tabChanged(_event: any): void {
        this.savedSelections.tab_selections.splice(this.tabIndex, 1, this.dialogForm.value);
        this.savedSelections.tab_index = _event.index;
        this.tabIndex = _event.index;
    }

    /**
     * Helper function to determine if mat-chip-option should be selected
     * Needed, because using the binding with formControl does not disable mat-chip-option
     */
    public isDisabled(value: string): boolean {
        return this.disabledControls.includes(value);
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
            chipOption.selected = false;
            if (nextState) {
                this.disabledControls.push(value);
            } else {
                this.disabledControls = this.disabledControls.filter(obj => !obj.includes(value));
            }
        }
    }

    /**
     *  Function to determine which options are available, set as defaults and disabled
     *  (based on property binding with the formgroup)
     */
    private async updateAvailableExportOptions(): Promise<void> {
        let hasNumber = false;
        let hasText = false;
        let hasAttachments = false;
        let hasPolls = false;
        let hasLoS = false;
        let hasModerationNote = false;
        let hasInternalComment = false;

        await this.modelRequestService.waitSubscriptionReady(AGENDA_LIST_ITEM_SUBSCRIPTION);
        const views = this.agendaItems.map(id => this.agendaRepo.getViewModel(id));
        for (const item of views) {
            if (item) {
                if (item.item_number !== undefined && item.item_number !== ``) {
                    hasNumber = true;
                }
                if (item.content_object?.text !== undefined && item.content_object?.text !== ``) {
                    hasText = true;
                }
                if (item.content_object?.attachment_meeting_mediafile_ids?.length) {
                    hasAttachments = true;
                }
                if (item.content_object?.poll_ids?.length) {
                    hasPolls = true;
                }
                if (item.content_object?.list_of_speakers?.speaker_ids?.length) {
                    hasLoS = true;
                }
                if (
                    item.content_object?.list_of_speakers?.moderator_notes !== undefined &&
                    item.content_object?.list_of_speakers?.moderator_notes !== ``
                ) {
                    hasModerationNote = true;
                }
                if (item.comment !== undefined && item.comment !== ``) {
                    hasInternalComment = true;
                }
            }
        }
        if (this.itemNumberChip && !hasNumber) {
            this.changeStateOfChipOption(this.itemNumberChip, true, `item_number`);
        }
        if (this.textChip && !hasText) {
            this.changeStateOfChipOption(this.textChip, true, `text`);
        }
        if (this.attachmentsChip && !hasAttachments) {
            this.changeStateOfChipOption(this.attachmentsChip, true, `attachments`);
        }
        if (this.pollsChip && !hasPolls) {
            this.changeStateOfChipOption(this.pollsChip, true, `polls`);
        }
        if (this.listOfSpeakersChip && !hasLoS) {
            this.changeStateOfChipOption(this.listOfSpeakersChip, true, `list_of_speakers`);
        }
        if (this.modelRequestService && !hasModerationNote) {
            this.changeStateOfChipOption(this.moderationNotesChip, true, `moderation_notes`);
        }
        if (this.internalCommentaryChip && !hasInternalComment) {
            this.changeStateOfChipOption(this.internalCommentaryChip, true, `internal_commentary`);
        }
    }

    private async initForm(): Promise<void> {
        this.dialogForm = this.formBuilder.group({
            format: [],
            content: [],
            metaInfo: [],
            pageLayout: [],
            headerFooter: []
        });
        this.storeService.get<SavedSelections>(`agenda-export-selection`).then(savedDefaults => {
            if (savedDefaults?.tab_index !== undefined) {
                this.savedSelections = savedDefaults;
            }
            this.tabGroup.selectedIndex = this.savedSelections.tab_index;
            this.dialogForm.patchValue(this.savedSelections.tab_selections[this.savedSelections.tab_index]);
        });

        // disable pageLayout if only one topic is selected
        if (this.agendaItems.length === 1) {
            this.dialogForm.get(`pageLayout`)!.disable();
        }
    }
}
