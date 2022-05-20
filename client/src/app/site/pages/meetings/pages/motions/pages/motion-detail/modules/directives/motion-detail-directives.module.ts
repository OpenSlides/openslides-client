import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ListenEditingDirective } from './listen-editing/listen-editing.directive';

const DECLARATIONS = [ListenEditingDirective];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule]
})
export class MotionDetailDirectivesModule {}
