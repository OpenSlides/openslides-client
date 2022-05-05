import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListenEditingDirective } from './listen-editing/listen-editing.directive';

const DECLARATIONS = [ListenEditingDirective];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule]
})
export class MotionDetailDirectivesModule {}
