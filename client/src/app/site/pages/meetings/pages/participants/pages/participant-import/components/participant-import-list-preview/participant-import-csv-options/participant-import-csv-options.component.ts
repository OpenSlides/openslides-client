import { AsyncPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatRadioButton, MatRadioChange, MatRadioGroup } from '@angular/material/radio';
import { MatDrawer } from '@angular/material/sidenav';
import { ViewPortService } from '@app/site/services/view-port.service';
import { TranslatePipe } from '@ngx-translate/core';

import { ParticipantImportService } from '../../../services';
import { sideNavCoordinationService } from '../../../services/participant-import-preview.service/participant-import-preview-sidenav-coordination.service';
import { BaseBackendImportService } from '@app/site/base/base-import.service/base-backend-import.service';
import { BackendImportListComponent } from '@app/ui/modules/import-list/components/via-backend-import-list/backend-import-list.component';
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
    private sideNavCoordinator = inject(sideNavCoordinationService);
    private CSVReload = inject(ParticipantImportCSVReloadService);

    @Input()
    public csvConfiguration: boolean;

    @Input()
    public csvReloadFunction: ParticipantImportService;

    @Input()
    public csvReloadButton: boolean;

    /**
     * The CSV-Configuration side drawer
     */
    @ViewChild(MatDrawer, { static: true })
    public csvConfigMenu: MatDrawer;

    public selectedEncodingOption = 'utf-8';
    public selectedColumnSeparatorOption = 'Automatic';
    public selectedTextSeparatorOption = "''";

    @Output()
    public selectedEncodingOutput = new EventEmitter<MatRadioChange>();

    @Output()
    public selectedColSepOutput = new EventEmitter<MatRadioChange>();

    @Output()
    public selectedTextSeparatorOutput = new EventEmitter<MatRadioChange>();

    // csvReload
    public selectNewFile(): void {
        this.CSVReload.reload();
    }

    @ViewChild(`fileInput`)
    public fileInput!: ElementRef<HTMLInputElement>;

    public ngOnInit(): void {
        this.sideNavCoordinator.drawer$.subscribe(drawer => {
            if (drawer === 'filterMenu' && this.csvConfigMenu.opened) {
                this.csvConfigMenu.close();
            }
        });
    }

    public openCsvConfig(): void {
        if (this.csvConfigMenu.opened) {
            this.sideNavCoordinator.open('filterMenu');
            this.csvConfigMenu.close();
            return;
        } else {
            this.sideNavCoordinator.open('csvConfigMenu');
            this.csvConfigMenu.open();
        }
    }
}
