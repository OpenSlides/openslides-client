import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MeetingsRoutingModule } from './meetings-routing.module';
import { MeetingsNavigationModule } from './modules/meetings-navigation';
import { InteractionServiceModule } from './pages/interaction/services/interaction-service.module';
import { SequentialNumberMappingService } from './services/sequential-number-mapping.service';

@NgModule({
    imports: [CommonModule, MeetingsRoutingModule, MeetingsNavigationModule, InteractionServiceModule]
})
export class MeetingsModule {
    public constructor(_sequentialNumberMappingService: SequentialNumberMappingService) {}
}
