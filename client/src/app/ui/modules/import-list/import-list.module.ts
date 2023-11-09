import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { ScrollingTableModule } from 'src/app/ui/modules/scrolling-table';

import { OpenSlidesTranslationModule } from '../../../site/modules/translations';
import { ImportListComponent } from './components/import-list/import-list.component';
import { BackendImportListComponent } from './components/via-backend-import-list/backend-import-list.component';
import { ImportListFirstTabDirective } from './directives/import-list-first-tab.directive';
import { ImportListLastTabDirective } from './directives/import-list-last-tab.directive';
import { ImportListStatusTemplateDirective } from './directives/import-list-status-template.directive';

const DECLARATIONS = [
    ImportListComponent,
    ImportListFirstTabDirective,
    ImportListLastTabDirective,
    ImportListStatusTemplateDirective,
    BackendImportListComponent
];

@NgModule({
    exports: [...DECLARATIONS, MatTabsModule, ScrollingTableModule],
    declarations: DECLARATIONS,
    imports: [
        CommonModule,
        MatCardModule,
        MatTabsModule,
        MatTooltipModule,
        MatIconModule,
        MatSelectModule,
        MatCheckboxModule,
        MatButtonModule,
        MatDialogModule,
        FormsModule,
        PortalModule,
        ScrollingTableModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ImportListModule {}
