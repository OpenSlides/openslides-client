import { Component, inject, viewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatDrawer } from '@angular/material/sidenav';
import { ViewPortService } from '@app/site/services/view-port.service';
import { TranslatePipe } from '@ngx-translate/core';

import { CSVOptionsService } from '../../../services/participant-import-preview.service/participant-import-preview-csv-encoding-options.service';

@Component({
    selector: 'os-participant-import-csv-options',
    templateUrl: './participant-import-csv-options.component.html',
    styleUrl: './participant-import-csv-options.component.scss',
    imports: [MatIcon, TranslatePipe, MatRadioButton, MatRadioGroup, MatDivider, MatDrawer, FormsModule],
    encapsulation: ViewEncapsulation.None
})
export class CSVOptionsComponent {
    public vp = inject(ViewPortService);
    private csvOptionsService = inject(CSVOptionsService);
    public enabled: boolean = this.csvOptionsService.toggleCSVOptions;
    public _viewContainerRef = inject(ViewContainerRef);

    /**
     * The CSV-Configuration side drawer
     */
    public readonly csvConfigMenu = viewChild.required<MatDrawer>(MatDrawer);

    public selectedEncoding = 'utf-8';
    public selectedColumnSeparator = '';
    public selectedTextSeparator = '"';

    public onEncodingChange(value: string): void {
        this.csvOptionsService.selectedConfig$.next({
            ...this.csvOptionsService.selectedConfig$.value,
            encoding: value
        });
    }

    public onTextSeparatorChange(value): void {
        this.csvOptionsService.selectedConfig$.next({
            ...this.csvOptionsService.selectedConfig$.value,
            textSeparator: value
        });
    }

    public onColumnSeparatorChange(value): void {
        this.csvOptionsService.selectedConfig$.next({
            ...this.csvOptionsService.selectedConfig$.value,
            columnSeparator: value
        });
    }
}
