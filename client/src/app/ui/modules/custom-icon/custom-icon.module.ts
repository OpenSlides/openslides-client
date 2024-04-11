import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CustomIconComponent } from './components/custom-icon/custom-icon.component';

@NgModule({
    declarations: [CustomIconComponent],
    imports: [CommonModule],
    exports: [CustomIconComponent]
})
export class CustomIconModule {}
