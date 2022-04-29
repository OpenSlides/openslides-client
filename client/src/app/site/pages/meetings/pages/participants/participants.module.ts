import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParticipantsRoutingModule } from './participants-routing.module';
import { ParticipantMainComponent } from './components/participant-main/participant-main.component';
import { RouterModule } from '@angular/router';
import { ParticipantCommonServiceModule } from './services/common/participant-common-service.module';

@NgModule({
    declarations: [ParticipantMainComponent],
    imports: [CommonModule, ParticipantsRoutingModule, ParticipantCommonServiceModule, RouterModule]
})
export class ParticipantsModule {}
