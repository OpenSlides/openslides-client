import {
    ChangeDetectionStrategy,
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
import { MatSelectChange } from '@angular/material/select';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { ValueLabelCombination } from '@app/infrastructure/utils/import/import-utils';
import { ParticipantImportCSVReloadService } from '@app/site/pages/meetings/pages/participants/pages/participant-import/services/participant-import-preview.service/participant-import-preview-reload-file.service';
import { BackendImportService } from '@app/ui/base/import-service';
import { firstValueFrom, map, Observable, of } from 'rxjs';

import { END_POSITION, START_POSITION } from '../../../scrolling-table/directives/scrolling-table-cell-position';
import { ImportListHeaderDefinition } from '../../definitions/import-list-header-definition';
import { ImportListFirstTabDirective } from '../../directives/import-list-first-tab.directive';
import { ImportListLastTabDirective } from '../../directives/import-list-last-tab.directive';
import { ImportListStatusTemplateDirective } from '../../directives/import-list-status-template.directive';
import { ImportListPreview } from '../../import-list-preview';

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
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class BackendImportListComponent extends ImportListPreview implements OnInit {
    public readonly END_POSITION = END_POSITION;
    public readonly START_POSITION = START_POSITION;

    @ContentChildren(ImportListFirstTabDirective)
    public importListFirstTabs!: QueryList<ImportListFirstTabDirective>;

    @ContentChildren(ImportListLastTabDirective)
    public importListLastTabs!: QueryList<ImportListLastTabDirective>;

    @ContentChild(ImportListStatusTemplateDirective, { read: TemplateRef })
    public importListStateTemplate: TemplateRef<any>;

    @ViewChild(`fileInput`)
    private fileInput!: ElementRef<HTMLInputElement>;

    @Input()
    public rowHeight = 50;

    @Input()
    public modelName = ``;

    @Input()
    public instructionsForImport = ``;

    @Input()
    public columnsInformation = ``;

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

    public readonly Phase = BackendImportPhase;

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
     * True if, after the first json-upload, the view is waiting for the user to confirm the import.
     */
    public get awaitingConfirm(): boolean {
        return this._state === BackendImportPhase.AWAITING_CONFIRM;
    }

    /**
     * True if the import has successfully finished.
     */
    public get finishedSuccessfully(): boolean {
        return this._state === BackendImportPhase.FINISHED;
    }

    /**
     * True if, after an attempted import failed, the view is waiting for the user to confirm the import on the new preview.
     */
    public get finishedWithWarning(): boolean {
        return this._state === BackendImportPhase.FINISHED_WITH_WARNING;
    }

    /**
     * True while an import is in progress.
     */
    public get isImporting(): boolean {
        return this._state === BackendImportPhase.IMPORTING;
    }

    /**
     * True if the preview can not be imported.
     */
    public get hasErrors(): boolean {
        return this._state === BackendImportPhase.ERROR;
    }

    /**
     * Currently selected encoding. Is set and changed by the config's available
     * encodings and user mat-select input
     */
    public selectedEncoding = `utf-8`;

    public isInFullscreen = false;

    /**
     * @returns the encodings available and their labels
     */
    public get encodings(): ValueLabelCombination[] {
        return this._importer.encodings;
    }

    /**
     * @returns the available column separators and their labels
     */
    public get columnSeparators(): ValueLabelCombination[] {
        return this._importer.columnSeparators;
    }

    /**
     * @eturns the available text separators and their labels
     */
    public get textSeparators(): ValueLabelCombination[] {
        return this._importer.textSeparators;
    }

    /**
     * If false there is something wrong with the data.
     */
    public get hasRowErrors(): boolean {
        return this._importer.previewHasRowErrors;
    }

    /**
     * Starts with a clean preview (removing any previously existing import previews)
     */
    public override ngOnInit(): void {
        this._requiredFields = this.createRequiredFields();
        this._importer.currentImportPhaseObservable.subscribe(phase => {
            if (phase === BackendImportPhase.LOADING_PREVIEW && this.fileInput) {
                this.fileInput.nativeElement.value = ``;
            }
            this._state = phase;
        });
        this._importer.previewsObservable.subscribe(previews => {
            this._rows = this.calculateRows(previews);
            this.uploadButton = previews?.some(preview => preview.state === 'error') ? true : false;
            this.fillPreviewData(previews);
            this.setHeaders({ preview: this._previewColumns });
        });
        this._dataSource = this.importer.previewsObservable.pipe(map(previews => this.calculateRows(previews)));
        this.CSVReloadService.openFileInput$.subscribe(async (newFile: Event) => {
            this.importer.onSelectFile(newFile);
        });
        this.cd.detectChanges();
    }

    /**
     * Triggers a change in the tab group: Clearing the preview selection
     */
    public onTabChange({ index }: MatTabChangeEvent): void {
        this.removeSelectedFile();
        this._importer.clearAll();
        this.selectedTabChanged.emit(index);
    }

    /**
     * True if there are custom tabs.
     */
    public hasSeveralTabs(): boolean {
        return this.importListFirstTabs.length + this.importListLastTabs.length > 0;
    }

    /**
     * triggers the importer's onSelectFile after a file has been chosen
     */
    public onSelectFile(event: any): void {
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
     * Trigger for the column separator selection.
     */
    public selectColSep(event: MatSelectChange): void {
        this._importer.columnSeparator = event.value;
        this._importer.refreshFile();
    }

    /**
     * Trigger for the column separator selection
     */
    public selectTextSep(event: MatSelectChange): void {
        this._importer.textSeparator = event.value;
        this._importer.refreshFile();
    }

    /**
     * Trigger for the encoding selection.
     */
    public selectEncoding(event: MatSelectChange): void {
        this._importer.encoding = event.value;
        this._importer.refreshFile();
    }

    /**
     * Opens a fullscreen dialog with the given template as content.
     */
    public async enterFullscreen(dialogTemplate: TemplateRef<any>): Promise<void> {
        this.isInFullscreen = true;
        const ref = this.dialog.open(dialogTemplate, { width: `80vw` });
        await firstValueFrom(ref.afterClosed());
        this.isInFullscreen = false;
    }

    protected get isParticipantImport(): boolean {
        return this.router.url.includes('participants');
    }

    protected selectedNewFile;

    private CSVReloadService = inject(ParticipantImportCSVReloadService);

    public constructor(
        private cd: ChangeDetectorRef,
        private router: Router
    ) {
        super();
    }

    /**
     * triggers the importer's onSelectFile after a file has been chosen
     */
    public onSelectedFile(event: Event): void {
        this._importer.onSelectFile(event);
        if (this.fileInput.nativeElement.value) {
            this.uploadButton = false;
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

    protected showPreview(): void {
        this.router.navigateByUrl(this.router.url.concat('/preview'));
    }
}
