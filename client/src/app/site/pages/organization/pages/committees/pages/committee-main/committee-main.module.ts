import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommitteeMainComponent } from './components/committee-main/committee-main.component';

@NgModule({
    declarations: [CommitteeMainComponent],
    imports: [CommonModule, RouterModule]
})
export class CommitteeMainModule {}
