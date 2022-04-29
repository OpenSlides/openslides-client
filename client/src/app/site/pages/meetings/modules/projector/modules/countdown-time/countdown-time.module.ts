import { NgModule } from '@angular/core';

import { CountdownTimeComponent } from './countdown-time.component';
import { CommonModule } from '@angular/common';

const DECLARATIONS = [CountdownTimeComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule]
})
export class CountdownTimeModule {}
