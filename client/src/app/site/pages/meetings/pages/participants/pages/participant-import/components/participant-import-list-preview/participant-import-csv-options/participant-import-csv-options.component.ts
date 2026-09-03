import { AsyncPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatDrawer } from '@angular/material/sidenav';
import { ViewPortService } from '@app/site/services/view-port.service';
import { TranslatePipe } from '@ngx-translate/core';

import { ParticipantImportService } from '../../../services';
import { CSVEncodingOptionsService } from '../../../services/participant-import-preview.service/participant-import-preview-csv-encoding-options.service';
import { ParticipantImportCSVReloadService } from '../../../services/participant-import-preview.service/participant-import-preview-reload-file.service';

@Component({
    selector: 'os-participant-import-csv-options',
    templateUrl: './participant-import-csv-options.component.html',
    styleUrl: './participant-import-csv-options.component.scss',
    imports: [
        MatIcon,
        TranslatePipe,
        AsyncPipe,
        MatButton,
        MatRadioButton,
        MatRadioGroup,
        MatDivider,
        MatDrawer,
        FormsModule
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager
})
export class CSVOptions implements OnInit {
    public vp = inject(ViewPortService);
    private csvEncodingOptions = inject(CSVEncodingOptionsService);
    private CSVReload = inject(ParticipantImportCSVReloadService);
    public toggleCSVOptions: boolean = this.csvEncodingOptions.toggleCSVOptions;

    @Input()
    public csvReloadFunction: ParticipantImportService;

    @Input()
    public csvReloadButton: boolean;

    /**
     * The CSV-Configuration side drawer
     */
    @ViewChild(MatDrawer, { static: true })
    public csvConfigMenu: MatDrawer;

    public selectedEncoding = 'utf-8';
    public selectedColumnSeparator = '';
    public selectedTextSeparator = '"';

    // csvReload
    public selectNewFile(event: Event): void {
        this.CSVReload.reload(event);
    }

    @ViewChild(`reloadFileInput`)
    public reloadFileInput?: ElementRef<HTMLInputElement>;

    public ngOnInit(): void {
        this.csvEncodingOptions.drawer$.subscribe(drawer => {
            if (drawer === 'filterMenu' && this.csvConfigMenu.opened) {
                this.csvConfigMenu.close();
            }
        });
    }

    public openCsvConfig(): void {
        if (this.csvConfigMenu.opened) {
            this.csvEncodingOptions.open('filterMenu');
            this.csvConfigMenu.close();
            return;
        } else {
            this.csvEncodingOptions.open('csvConfigMenu');
            this.csvConfigMenu.open();
        }
    }

    public onEncodingChange(value: string): void {
        this.csvEncodingOptions.SelectedConfig$.next({
            ...this.csvEncodingOptions.SelectedConfig$.value,
            encoding: value
        });
    }

    public onTextSeparatorChange(value): void {
        this.csvEncodingOptions.SelectedConfig$.next({
            ...this.csvEncodingOptions.SelectedConfig$.value,
            textSeparator: value
        });
    }

    public onColumnSeparatorChange(value): void {
        this.csvEncodingOptions.SelectedConfig$.next({
            ...this.csvEncodingOptions.SelectedConfig$.value,
            columnSeparator: value
        });
    }
}
