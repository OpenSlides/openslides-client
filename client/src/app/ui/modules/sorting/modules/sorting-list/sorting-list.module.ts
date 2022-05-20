import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { SortingListComponent } from './components/sorting-list/sorting-list.component';

const DECLARATIONS = [SortingListComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, MatIconModule, DragDropModule, OpenSlidesTranslationModule.forChild()]
})
export class SortingListModule {}
