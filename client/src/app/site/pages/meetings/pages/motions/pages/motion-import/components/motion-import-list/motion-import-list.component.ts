import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { BaseImportListComponent } from 'src/app/site/base/base-import-list.component';
import { Motion } from 'src/app/domain/models/motions/motion';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';
import { getVerboseNameOfMotionProperty, motionExpectedHeaders } from '../../../../services/export/definitions';
import { MotionImportService } from '../../services/motion-import.service';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';

@Component({
    selector: 'os-motion-import-list',
    templateUrl: './motion-import-list.component.html',
    styleUrls: ['./motion-import-list.component.scss']
})
export class MotionImportListComponent extends BaseImportListComponent<Motion> {
    public possibleFields = motionExpectedHeaders.map(header => getVerboseNameOfMotionProperty(header));

    public get columns(): ImportListHeaderDefinition[] {
        return motionExpectedHeaders.map(header => ({
            prop: `newEntry.${header}`,
            label: this.translate.instant(getVerboseNameOfMotionProperty(header)),
            isTableColumn: true,
            isRequired: header === `title` || header === `text`
        }));
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        public override importer: MotionImportService
    ) {
        super(componentServiceCollector, translate, importer);
    }

    public getVerboseName(property: keyof ViewMotion): string {
        return getVerboseNameOfMotionProperty(property);
    }
}
