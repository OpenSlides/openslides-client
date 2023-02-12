import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

import { ChipSelectComponent } from './components/chip-select/chip-select.component';
import { ChipSelectChipComponent } from './components/chip-select-chip/chip-select-chip.component';

@NgModule({
    exports: [ChipSelectComponent, ChipSelectChipComponent],
    declarations: [ChipSelectComponent, ChipSelectChipComponent],
    imports: [CommonModule, MatMenuModule, MatChipsModule]
})
export class ChipSelectModule {}
