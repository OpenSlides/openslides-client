import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

import { ChipSelectComponent } from './components/chip-select/chip-select.component';

@NgModule({
    exports: [ChipSelectComponent],
    declarations: [ChipSelectComponent],
    imports: [CommonModule, MatMenuModule, MatChipsModule]
})
export class ChipSelectModule {}
