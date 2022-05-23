import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PollMainComponent } from './components/poll-main/poll-main.component';
import { PollsRoutingModule } from './polls-routing.module';

@NgModule({
    declarations: [PollMainComponent],
    imports: [CommonModule, PollsRoutingModule, RouterModule]
})
export class PollsModule {}
