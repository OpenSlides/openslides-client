import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';

import { ChipSelectComponent } from './components/chip-select/chip-select.component';
import { ChipSelectChipComponent } from './components/chip-select-chip/chip-select-chip.component';

@NgModule({
    exports: [ChipSelectComponent, ChipSelectChipComponent],
    declarations: [ChipSelectComponent, ChipSelectChipComponent],
    imports: [CommonModule, MatMenuModule, MatChipsModule]
})
export class ChipSelectModule {}
