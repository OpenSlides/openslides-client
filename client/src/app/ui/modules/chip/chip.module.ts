import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';

import { ChipComponent } from './components/chip/chip.component';

const DECLARATIONS = [ChipComponent];

@NgModule({
    exports: DECLARATIONS,
    declarations: DECLARATIONS,
    imports: [CommonModule, MatChipsModule, MatRippleModule]
})
export class ChipModule {}
