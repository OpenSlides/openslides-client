import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ParticipantMainComponent } from './components/participant-main/participant-main.component';
import { ParticipantsRoutingModule } from './participants-routing.module';
import { ParticipantCommonServiceModule } from './services/common/participant-common-service.module';

@NgModule({
    declarations: [ParticipantMainComponent],
    imports: [CommonModule, ParticipantsRoutingModule, ParticipantCommonServiceModule, RouterModule]
})
export class ParticipantsModule {}
