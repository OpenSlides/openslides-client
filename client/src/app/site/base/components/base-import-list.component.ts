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
    public hasFile = false;

    /**
     * @returns the amount of import items that will be imported
     */
    public get newCount(): number {
        return this.importer && this.hasFile ? this.importer.summary.new : 0;
    }

    /**
     * Constructor. Initializes the table and subscribes to import errors
     *
     * @param importer The import service, depending on the implementation
     */

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        protected importer: BaseImportService<M>
    ) {
        super(componentServiceCollector, translate);
        this.initTable();
    }

    /**
     * Initializes the table
     */
    public initTable(): void {
        const entryObservable = this.importer.getNewEntries();
        this.subscriptions.push(
            entryObservable.pipe(distinctUntilChanged(), auditTime(100)).subscribe(newEntries => {
                if (newEntries?.length) {
                }
                this.hasFile = newEntries.length > 0;
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
