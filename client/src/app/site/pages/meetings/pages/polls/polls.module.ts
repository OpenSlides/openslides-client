import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PollsRoutingModule } from './polls-routing.module';
import { PollMainComponent } from './components/poll-main/poll-main.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [PollMainComponent],
    imports: [CommonModule, PollsRoutingModule, RouterModule]
})
export class PollsModule {}
