import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DesignMainComponent } from './components/design-main/design-main.component';

@NgModule({
    declarations: [DesignMainComponent],
    imports: [CommonModule, RouterModule]
})
export class DesignMainModule {}
