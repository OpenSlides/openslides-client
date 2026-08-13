import { AsyncPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ViewPortService } from '@app/site/services/view-port.service';
import { SortFilterBarComponent } from '@app/ui/modules/list/components/sort-filter-bar/sort-filter-bar.component';
import { TranslatePipe } from '@ngx-translate/core';
import { ParticipantImportService } from '../../../services';
import { Identifiable } from '@app/domain/interfaces';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatDivider } from '@angular/material/divider';
import { MatDrawer } from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';
import { sideNavCoordinationService } from '../../../services/participant-import-preview.service/participant-import-preview-csv-options.service';

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
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class CSVOptions implements OnInit {
    public vp = inject(ViewPortService);
    private sideNavCoordinator = inject(sideNavCoordinationService);

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
    public selectedEncodingOutput = new EventEmitter<void>();

    @Output()
    public selectedColSepOutput = new EventEmitter<void>();

    @Output()
    public selectedTextSeparatorOutput = new EventEmitter<void>();

    @Output() // csvReload
    public selectNewFile = new EventEmitter<Event>();

    @ViewChild(`fileInput`)
    private fileInput!: ElementRef<HTMLInputElement>;

    ngOnInit(): void {
        this.sideNavCoordinator.drawer$.subscribe(drawer => {
            if (drawer === 'filterMenu' && this.csvConfigMenu.opened) {
                this.csvConfigMenu.close();
            }
        });
    }

    public sendSelectedEncoding($event): void {
        this.selectedEncodingOutput.emit($event);
    }

    public sendSelectedColumnSeparator($event): void {
        this.selectedColSepOutput.emit($event);
    }

    public sendSelectedTextSeparator($event): void {
        this.selectedTextSeparatorOutput.emit($event);
    }

    public sendCsvReload(event: Event): void {
        this.selectNewFile.emit(event);
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
