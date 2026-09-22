import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { mediumDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { ParticipantImportListInfoDialogComponent } from '@app/site/pages/meetings/pages/participants/pages/participant-import/components/participant-import-list-info-dialog/participant-import-list-info-dialog.component';
import { BackendImportService } from '@app/ui/base/import-service';
import { PipesModule } from '@app/ui/pipes';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, Observable, of } from 'rxjs';

import { ImportListHeaderDefinition } from '../../../definitions';
import { BackendImportPhase } from '../backend-import-list.component';

@Component({
    selector: `os-backend-import-participant-list`,
    templateUrl: `./backend-import-participant-list.component.html`,
    styleUrls: [`./backend-import-participant-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatDialogModule,
        MatIcon,
        MatCard,
        MatLabel,
        MatCardContent,
        TranslatePipe,
        AsyncPipe,
        PipesModule,
        MatButton,
        MatIconButton
    ]
})
export class BackendImportParticipantListComponent {
    @Input()
    public instructionsForImport = ``;

    @Input()
    public columnsInformation = ``;

    /**
     * Client-side definition of required/accepted columns.
     * Ensures that the client can display information about how the import works.
     */
    @Input()
    public set defaultColumns(cols: ImportListHeaderDefinition[]) {
        this._defaultColumns = cols;
    }

    public get defaultColumns(): ImportListHeaderDefinition[] {
        return this._defaultColumns;
    }

    /**
     * Defines all necessary and optional fields, that a .csv-file can contain.
     */
    @Input()
    public possibleFields: string[] = [];

    @Input()
    public set importer(importer: BackendImportService) {
        this._importer = importer;
    }

    public get importer(): BackendImportService {
        return this._importer;
    }

    @ViewChild(`fileInput`)
    private fileInput!: ElementRef<HTMLInputElement>;

    protected uploadButton = true;

    private _importer!: BackendImportService;
    private _defaultColumns: ImportListHeaderDefinition[] = [];
    private _state: BackendImportPhase = BackendImportPhase.LOADING_PREVIEW;
    private dialog = inject(MatDialog);

    protected get isParticipantImport(): boolean {
        return this.router.url.includes('participants');
    }

    /**
     * Observable that allows one to monitor the currenty selected file.
     */
    public get rawFileObservable(): Observable<File | null> {
        return this._importer?.rawFileObservable || of(null);
    }

    /**
     * True if the import has successfully finished.
     */
    public get finishedSuccessfully(): boolean {
        return this._state === BackendImportPhase.FINISHED;
    }

    public constructor(private router: Router) {}

    public isString(value: any): value is string {
        return typeof value === `string`;
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
     * Opens an info dialog with the given template as content.
     */
    public async openDialog(): Promise<void> {
        const ref = this.dialog.open(ParticipantImportListInfoDialogComponent, {
            ...mediumDialogSettings
        });
        await firstValueFrom(ref.afterClosed());
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

    /**
     * A function to trigger the csv example download.
     */
    public downloadCsvExample(): void {
        this._importer.downloadCsvExample();
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
