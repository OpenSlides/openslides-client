import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './components/list/list.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { PblNgridModule } from '@pebula/ngrid';
import { PblNgridTargetEventsModule } from '@pebula/ngrid/target-events';
import { PblNgridMaterialModule } from '@pebula/ngrid-material';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { SortFilterBarComponent } from './components/sort-filter-bar/sort-filter-bar.component';
import { SortBottomSheetComponent } from './components/sort-bottom-sheet/sort-bottom-sheet.component';
import { FilterMenuComponent } from './components/filter-menu/filter-menu.component';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { InputModule } from 'src/app/ui/modules/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

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
    ScrollingModule,
    PblNgridModule,
    PblNgridMaterialModule,
    PblNgridTargetEventsModule
];
const DECLARATIONS = [ListComponent];

@NgModule({
    exports: [...DECLARATIONS, PblNgridModule],
    declarations: [...DECLARATIONS, SortFilterBarComponent, SortBottomSheetComponent, FilterMenuComponent],
    imports: [CommonModule, OpenSlidesTranslationModule.forChild(), IconContainerModule, InputModule, ...MODULES]
})
export class ListModule {}
