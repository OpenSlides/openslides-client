import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

import { SortingTreeComponent } from './components/sorting-tree/sorting-tree.component';

const DECLARATIONS = [SortingTreeComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, CdkTreeModule, DragDropModule, MatIconModule, MatButtonModule]
})
export class SortingTreeModule {}
