import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';

import { ScrollingTableComponent } from './components/scrolling-table/scrolling-table.component';
import { ScrollingTableCellDirective } from './directives/scrolling-table-cell.directive';
import { ScrollingTableCellLabelDirective } from './directives/scrolling-table-cell-label.directive';
import { ScrollingTableNoDataDirective } from './directives/scrolling-table-no-data.directive';
import { ScrollingTableServiceModule } from './services/scrolling-table-service.module';

const DECLARATIONS = [
    ScrollingTableComponent,
    ScrollingTableCellDirective,
    ScrollingTableCellLabelDirective,
    ScrollingTableNoDataDirective
];

@NgModule({
    declarations: [...DECLARATIONS],
    imports: [
        CommonModule,
        FormsModule,
        ScrollingModule,
        PortalModule,
        MatTableModule,
        MatCheckboxModule,
        ScrollingTableServiceModule
    ],
    exports: DECLARATIONS
})
export class ScrollingTableModule {}
