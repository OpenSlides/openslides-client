import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortingListComponent } from './components/sorting-list/sorting-list.component';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

const DECLARATIONS = [SortingListComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, MatIconModule, DragDropModule, OpenSlidesTranslationModule.forChild()]
})
export class SortingListModule {}
