import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
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
