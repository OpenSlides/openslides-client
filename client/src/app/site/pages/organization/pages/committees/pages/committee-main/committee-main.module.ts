import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommitteeMainComponent } from './components/committee-main/committee-main.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [CommitteeMainComponent],
    imports: [CommonModule, RouterModule]
})
export class CommitteeMainModule {}
