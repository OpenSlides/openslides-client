import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconContainerComponent } from './components/icon-container/icon-container.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

const DECLARATIONS = [IconContainerComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, MatIconModule, MatTooltipModule]
})
export class IconContainerModule {}
