import {
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { infoDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { BackendImportService } from '@app/ui/base/import-service';
import { firstValueFrom, Observable, of } from 'rxjs';

import { END_POSITION, START_POSITION } from '../../../scrolling-table/directives/scrolling-table-cell-position';
import { BackendImportHeader } from '../../definitions/backend-import-preview';
import { ImportListHeaderDefinition } from '../../definitions/import-list-header-definition';
import { ImportListFirstTabDirective } from '../../directives/import-list-first-tab.directive';
import { ImportListLastTabDirective } from '../../directives/import-list-last-tab.directive';
import { ImportListStatusTemplateDirective } from '../../directives/import-list-status-template.directive';
import { ParticipantImportCSVReloadService } from '@app/site/pages/meetings/pages/participants/pages/participant-import/services/participant-import-preview.service/participant-import-preview-reload-file.service';

export enum BackendImportPhase {
    LOADING_PREVIEW,
    AWAITING_CONFIRM,
    IMPORTING,
    FINISHED,
    ERROR,
    FINISHED_WITH_WARNING
}

@Component({
    selector: `os-backend-import-list`,
    templateUrl: `./backend-import-list.component.html`,
    styleUrls: [`./backend-import-list.component.scss`],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class BackendImportListComponent implements OnInit {
    public readonly END_POSITION = END_POSITION;
    public readonly START_POSITION = START_POSITION;

    @ContentChildren(ImportListFirstTabDirective)
    public importListFirstTabs!: QueryList<ImportListFirstTabDirective>;

    @ContentChildren(ImportListLastTabDirective)
    public importListLastTabs!: QueryList<ImportListLastTabDirective>;

    @ContentChild(ImportListStatusTemplateDirective, { read: TemplateRef })
    public importListStateTemplate: TemplateRef<any>;

    @ViewChild(`fileInput`)
    public fileInput!: ElementRef<HTMLInputElement>;

    @Input()
    public modelName = ``;

    @Input()
    public additionalInfo = ``;

    @Input()
    public set importer(importer: BackendImportService) {
        this._importer = importer;
    }

    public get importer(): BackendImportService {
        return this._importer;
    }

    private _importer!: BackendImportService;

    /**
     * Defines all necessary and optional fields, that a .csv-file can contain.
     */
    @Input()
    public possibleFields: string[] = [];

    @Output()
    public selectedTabChanged = new EventEmitter<number>();

    /**
     * Observable that allows one to monitor the currenty selected file.
     */
    public get rawFileObservable(): Observable<File | null> {
        return this._importer?.rawFileObservable || of(null);
    }

    /**
     * Client-side definition of required/accepted columns.
     * Ensures that the client can display information about how the import works.
     */
    @Input()
    public set defaultColumns(cols: ImportListHeaderDefinition[]) {
        this._defaultColumns = cols;
        this.setHeaders({ default: cols });
    }

    public get defaultColumns(): ImportListHeaderDefinition[] {
        return this._defaultColumns;
    }

    /**
     * True if the import has successfully finished.
     */
    public get finishedSuccessfully(): boolean {
        return this._state === BackendImportPhase.FINISHED;
    }

    protected get isParticipantImport(): boolean {
        return this.router.url.includes('participants');
    }

    private _state: BackendImportPhase = BackendImportPhase.LOADING_PREVIEW;
    private _defaultColumns: ImportListHeaderDefinition[] = [];

    private _headers: Record<string, { default?: ImportListHeaderDefinition; preview?: BackendImportHeader }> = {};

    protected uploadButton: boolean;
    protected selectedNewFile;

    private dialog = inject(MatDialog);
    private CSVReloadService = inject(ParticipantImportCSVReloadService);

    public constructor(
        private cd: ChangeDetectorRef,
        private router: Router
    ) {}

    /**
     * Starts with a clean preview (removing any previously existing import previews)
     */
    public ngOnInit(): void {
        this._importer.clearAll();
        this.uploadButton = true;
        this._importer.currentImportPhaseObservable.subscribe(phase => {
            if (phase === BackendImportPhase.LOADING_PREVIEW && this.fileInput) {
                this.fileInput.nativeElement.value = ``;
            }
            this._state = phase;
        });
        this.CSVReloadService.openFileInput$.subscribe(() => {
            const target = this.fileInput.nativeElement.click();
            this._importer.onSelectFile(target);
        });
        this.cd.detectChanges();
    }

    /**
     * triggers the importer's onSelectFile after a file has been chosen
     */
    public onSelectedFile(event: Event): void {
        this.uploadButton = false;
        this._importer.onSelectFile(event);
    }

    /**
     * Removes the selected file and also empties the preview.
     */
    public removeSelectedFile(clearImporter = true): void {
        if (this.fileInput) {
            this.fileInput.nativeElement.value = ``;
            this.uploadButton = true;
        }
        if (clearImporter) {
            this._importer.clearFile();
        }
    }

    /**
     * A function to trigger the csv example download.
     */
    public downloadCsvExample(): void {
        this._importer.downloadCsvExample();
    }

    /**
     * Opens an info dialog with the given template as content.
     */
    public async openDialog(dialogTemplate: TemplateRef<any>): Promise<void> {
        const ref = this.dialog.open(dialogTemplate, infoDialogSettings);
        await firstValueFrom(ref.afterClosed());
    }

    public isString(value: any): value is string {
        return typeof value === `string`;
    }

    private setHeaders(data: { default?: ImportListHeaderDefinition[]; preview?: BackendImportHeader[] }): void {
        for (const key of Object.keys(data)) {
            for (const header of data[key] ?? []) {
                if (!this._headers[header.property]) {
                    this._headers[header.property] = { [key]: header };
                } else {
                    this._headers[header.property][key] = header;
                }
            }
        }
    }

    public onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    public onDropSuccess(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) {
            return;
        }
        const droppedFile = {
            target: {
                files: files
            }
        };
        try {
            this._importer.onSelectFile(droppedFile);
            this.uploadButton = false;
        } catch {
            this.uploadButton = false;
        }
    }

    public onChange(event: Event): void {
        this._importer.onSelectFile(event);
    }

    protected showPreview(): void {
        this.router.navigateByUrl(this.router.url.concat('/preview'));
    }

    protected sendCsvReload(event: Event): void {
        this._importer.onSelectFile(event);
    }
}
