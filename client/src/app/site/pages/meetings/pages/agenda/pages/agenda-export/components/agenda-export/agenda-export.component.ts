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
import { BaseComponent } from 'src/app/site/base/base.component';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { ExportFileFormat } from '../../../../../motions/services/export/definitions';

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
        OpenSlidesTranslationModule
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
    // Store fileformats with corresponding tab group index
    private fileFormats: ExportFileFormat[] = [ExportFileFormat.PDF, ExportFileFormat.CSV];

    public constructor(private formBuilder: UntypedFormBuilder) {
        super();
        this.initForm();
    }

    public cancelExport(): void {}
    public exportAgenda(): void {}
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
}
