import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IconContainerComponent } from './components/icon-container/icon-container.component';

const DECLARATIONS = [IconContainerComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, MatIconModule, MatTooltipModule]
})
export class IconContainerModule {}
