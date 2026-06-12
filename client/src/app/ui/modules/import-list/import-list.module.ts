import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditorModule } from 'src/app/ui/modules/editor/editor.module';
import { ScrollingTableModule } from 'src/app/ui/modules/scrolling-table';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';

import { OpenSlidesTranslationModule } from '../../../site/modules/translations';
import { BackendImportListComponent } from './components/via-backend-import-list/backend-import-list.component';
import { ImportListFirstTabDirective } from './directives/import-list-first-tab.directive';
import { ImportListLastTabDirective } from './directives/import-list-last-tab.directive';
import { ImportListStatusTemplateDirective } from './directives/import-list-status-template.directive';

const DECLARATIONS = [
    BackendImportListComponent,
    ImportListFirstTabDirective,
    ImportListLastTabDirective,
    ImportListStatusTemplateDirective
];

@NgModule({
    exports: [...DECLARATIONS, MatTabsModule, ScrollingTableModule],
    declarations: DECLARATIONS,
    imports: [
        EditorModule,
        PipesModule,
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
