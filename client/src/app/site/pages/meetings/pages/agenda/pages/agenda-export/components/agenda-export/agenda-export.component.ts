import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { Id } from 'src/app/domain/definitions/key-types';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseComponent } from 'src/app/site/base/base.component';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

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
export class AgendaExportComponent extends BaseComponent implements OnDestroy {
    public dialogForm!: UntypedFormGroup;

    @ViewChild(`tabGroup`)
    public tabGroup!: MatTabGroup;

    public get isPDFFormat(): boolean {
        return this.fileFormats[this.tabIndex] === ExportFileFormat.PDF;
    }

    public get isCSVFormat(): boolean {
        return this.fileFormats[this.tabIndex] === ExportFileFormat.CSV;
    }

    private pdfDefaults = {
        content: [`item_number`, `title`, `text`, `attachments`, `moderation_notes`]
    };

    private csvDefaults = {
        content: [`item_number`, `title`, `text`, `attachments`, `moderation_notes`],
        metaInfo: [`duration`]
    };

    private tabIndex = 0;
    private agendaItems: Id[] = [];
    // Store fileformats with corresponding tab group index
    private fileFormats: ExportFileFormat[] = [ExportFileFormat.PDF, ExportFileFormat.CSV];
    private savedSelections: SavedSelections = {
        tab_index: 0,
        tab_selections: [this.pdfDefaults, this.csvDefaults]
    };

    public constructor(
        private route: ActivatedRoute,
        private formBuilder: UntypedFormBuilder,
        private storeService: StorageService,
        private agendaRepo: AgendaItemControllerService,
        private agendaExportService: AgendaItemExportService
    ) {
        super();
        this.subscriptions.push(
            this.route.queryParamMap.subscribe(paramMap => {
                this.agendaItems = paramMap.getAll(`agenda-items`).map(value => Number(value));
            })
        );
        this.initForm();
    }

    public override ngOnDestroy(): void {
        this.savedSelections.tab_selections.splice(this.tabIndex, 1, this.dialogForm.value);
        this.storeService.set(`agenda-export-selection`, this.savedSelections);
        super.ngOnDestroy();
    }

    public cancelExport(): void {
        this.router.navigate([`..`], { relativeTo: this.route });
    }

    public exportAgenda(): void {
        const views = this.agendaItems.map(id => this.agendaRepo.getViewModel(id));
        console.log(`isSelected `, this.isSelected(`metaInfo`, `done`));
        if (this.isPDFFormat) {
            this.agendaExportService.exportAsPdf(views, this.dialogForm.get(`content`).value, [
                ...(this.dialogForm.get(`pageLayout`).value as string[]),
                ...this.dialogForm.get(`headerFooter`).value
            ]);
        } else if (this.isCSVFormat) {
            this.agendaExportService.exportAsCsv(
                views,
                this.dialogForm.get(`content`).value,
                this.dialogForm.get(`metaInfo`).value
            );
        }
    }

    public afterTabChanged(): void {
        this.dialogForm.patchValue(this.savedSelections.tab_selections[this.tabIndex]);
    }

    public tabChanged(_event: any): void {
        this.savedSelections.tab_selections.splice(this.tabIndex, 1, this.dialogForm.value);
        this.savedSelections.tab_index = _event.index;
        this.tabIndex = _event.index;
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
    }

    private isSelected(field: string, value: string): boolean {
        return this.dialogForm.get(field).value?.includes(value);
    }
}
