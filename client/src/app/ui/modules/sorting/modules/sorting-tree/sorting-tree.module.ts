import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { SortingTreeComponent } from './components/sorting-tree/sorting-tree.component';

const DECLARATIONS = [SortingTreeComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, CdkTreeModule, DragDropModule, MatIconModule, MatButtonModule]
})
export class SortingTreeModule {}
