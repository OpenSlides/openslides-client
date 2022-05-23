import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SortingListModule, SortingTreeModule } from './modules';

const MODULES = [SortingListModule, SortingTreeModule];

@NgModule({
    declarations: [],
    imports: [CommonModule],
    exports: MODULES
})
export class SortingModule {}
