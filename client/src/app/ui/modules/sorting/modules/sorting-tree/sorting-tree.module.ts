import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortingTreeComponent } from './components/sorting-tree/sorting-tree.component';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';

const DECLARATIONS = [SortingTreeComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, CdkTreeModule, DragDropModule, MatIconModule]
})
export class SortingTreeModule {}
