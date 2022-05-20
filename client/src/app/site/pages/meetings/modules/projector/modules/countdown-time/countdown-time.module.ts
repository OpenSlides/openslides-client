import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CountdownTimeComponent } from './countdown-time.component';

const DECLARATIONS = [CountdownTimeComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule]
})
export class CountdownTimeModule {}
