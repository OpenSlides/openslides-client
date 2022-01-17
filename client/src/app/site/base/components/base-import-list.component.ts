import { Directive, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseImportService } from 'app/core/ui-services/base-import.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { getLongPreview, getShortPreview } from 'app/shared/utils/previewStrings';
import { auditTime, distinctUntilChanged } from 'rxjs/operators';

import { Identifiable } from '../../../shared/models/base/identifiable';
import { BaseModelContextComponent } from './base-model-context.component';

@Directive()
export abstract class BaseImportListComponent<M extends Identifiable>
    extends BaseModelContextComponent
    implements OnInit
{
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

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        protected importer: BaseImportService<M>
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        super.ngOnInit();
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
