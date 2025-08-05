import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'src/app/site/base/base.component';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { ExportFileFormat } from '../../../../../motions/services/export/definitions';
import { AgendaItemControllerService } from '../../../../services/agenda-item-controller.service/agenda-item-controller.service';
import { AgendaItemListModule } from '../../../agenda-item-list/agenda-item-list.module';
import { AgendaItemExportService } from '../../../agenda-item-list/services/agenda-item-export.service/agenda-item-export.service';

@Component({
    selector: `os-agenda-export`,
    templateUrl: `./agenda-export.component.html`,
    styleUrl: `./agenda-export.component.scss`,
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
export class AgendaExportComponent extends BaseComponent {
    public dialogForm!: UntypedFormGroup;

    public get isPDFFormat(): boolean {
        return this.fileFormats[this.tabIndex] === ExportFileFormat.PDF;
    }

    public get isCSVFormat(): boolean {
        return this.fileFormats[this.tabIndex] === ExportFileFormat.CSV;
    }

    private tabIndex = 0;
    private agendaItems = [];
    // Store fileformats with corresponding tab group index
    private fileFormats: ExportFileFormat[] = [ExportFileFormat.PDF, ExportFileFormat.CSV];

    public constructor(
        private route: ActivatedRoute,
        private formBuilder: UntypedFormBuilder,
        private agendaRepo: AgendaItemControllerService,
        private agendaExportService: AgendaItemExportService
    ) {
        super();
        this.subscriptions.push(
            this.route.queryParams.subscribe(params => {
                this.agendaItems = params[`agenda-items`].length > 1 ? params[`agenda-items`] : [params[`agenda-items`]];
            })
        );
        this.initForm();
    }

    public cancelExport(): void {}
    public exportAgenda(): void {
        const views = this.agendaItems.map(id => this.agendaRepo.getViewModel(id));
        console.log(`isSelected `, this.isSelected(`metaInfo`, `done`));
        if (this.isPDFFormat) {
            this.agendaExportService.exportAsPdf(views);
        } else if (this.isCSVFormat) {
            this.agendaExportService.exportAsCsv(views);
        }
    }

    public afterTabChanged(): void {}
    public tabChanged(_event: any): void {
        this.tabIndex = _event.index;
    }

    private initForm(): void {
        this.dialogForm = this.formBuilder.group({
            format: [],
            content: [],
            metaInfo: [],
            pageLayout: [],
            headerFooter: []
        });
    }

    private isSelected(field: string, value: string): boolean {
        return this.dialogForm.get(field).value?.includes(value);
    }
}
