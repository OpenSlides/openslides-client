import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeetingsRoutingModule } from './meetings-routing.module';
import { MeetingsNavigationModule } from './modules/meetings-navigation';
import { SequentialNumberMappingService } from './services/sequential-number-mapping.service';
import { InteractionServiceModule } from './pages/interaction/services/interaction-service.module';

@NgModule({
    imports: [CommonModule, MeetingsRoutingModule, MeetingsNavigationModule, InteractionServiceModule]
})
export class MeetingsModule {
    public constructor(_sequentialNumberMappingService: SequentialNumberMappingService) {}
}
