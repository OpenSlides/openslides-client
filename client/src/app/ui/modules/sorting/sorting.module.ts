import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SortingListModule } from './modules/sorting-list/sorting-list.module';
import { SortingTreeModule } from './modules/sorting-tree/sorting-tree.module';

const MODULES = [SortingListModule, SortingTreeModule];

@NgModule({
    declarations: [],
    imports: [CommonModule],
    exports: MODULES
})
export class SortingModule {}
