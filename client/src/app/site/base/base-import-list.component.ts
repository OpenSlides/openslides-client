import { Directive, OnInit } from '@angular/core';
import { auditTime, distinctUntilChanged } from 'rxjs';
import { BaseComponent } from 'src/app/site/base/base.component';

import { Identifiable } from '../../domain/interfaces';
import { getLongPreview, getShortPreview } from '../../infrastructure/utils';
import { BaseImportService } from './base-import.service';

@Directive()
export abstract class BaseImportListComponent<M extends Identifiable> extends BaseComponent implements OnInit {
    /**
     * Helper function for previews
     */
    public getLongPreview = getLongPreview;

    /**
     * Helper function for previews
     */
    public getShortPreview = getShortPreview;

    /**
     * Switch that turns true if a file has been selected in the input
     */
    public get canImport(): boolean {
        return this._hasFile && this._modelsToCreateAmount > 0;
    }

    private _hasFile = false;
    private _modelsToCreateAmount = 0;

    public constructor(protected importer: BaseImportService<M>) {
        super();
    }

    public ngOnInit(): void {
        this.initTable();
    }

    /**
     * Initializes the table
     */
    public initTable(): void {
        const entryObservable = this.importer.getNewEntriesObservable();
        this.subscriptions.push(
            entryObservable.pipe(distinctUntilChanged(), auditTime(100)).subscribe(newEntries => {
                this._hasFile = newEntries.length > 0;
                this._modelsToCreateAmount = newEntries.length;
            })
        );
    }

    /**
     * Triggers the importer's import
     *
     */
    public async doImport(): Promise<void> {
        await this.importer.doImport();
    }
}
