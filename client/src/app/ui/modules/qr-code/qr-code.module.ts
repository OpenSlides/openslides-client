import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { QrCodeComponent } from './components/qr-code/qr-code.component';

const DECLARATIONS = [QrCodeComponent];

@NgModule({
    declarations: DECLARATIONS,
    imports: [CommonModule],
    exports: DECLARATIONS
})
export class QrCodeModule {}
