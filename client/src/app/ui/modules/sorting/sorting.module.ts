import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortingTreeModule, SortingListModule } from './modules';

const MODULES = [SortingListModule, SortingTreeModule];

@NgModule({
    declarations: [],
    imports: [CommonModule],
    exports: MODULES
})
export class SortingModule {}
