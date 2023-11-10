import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { InputModule } from 'src/app/ui/modules/input';
import { ScrollingTableModule } from 'src/app/ui/modules/scrolling-table';

import { FilterMenuComponent } from './components/filter-menu/filter-menu.component';
import { ListComponent } from './components/list/list.component';
import { SortBottomSheetComponent } from './components/sort-bottom-sheet/sort-bottom-sheet.component';
import { SortFilterBarComponent } from './components/sort-filter-bar/sort-filter-bar.component';
import { ViewListComponent } from './components/view-list/view-list.component';

const MODULES = [
    MatSidenavModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatChipsModule,
    MatDividerModule,
    MatMenuModule,
    MatIconModule,
    MatListModule,
    MatBottomSheetModule,
    MatBadgeModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    ScrollingModule,
    ScrollingTableModule
];
const DECLARATIONS = [ListComponent, ViewListComponent];

@NgModule({
    exports: [...DECLARATIONS, ScrollingTableModule],
    declarations: [...DECLARATIONS, SortFilterBarComponent, SortBottomSheetComponent, FilterMenuComponent],
    imports: [CommonModule, OpenSlidesTranslationModule.forChild(), IconContainerModule, InputModule, ...MODULES]
})
export class ListModule {}
