import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { OrgaMeetingsRoutingModule } from './orga-meetings-routing.module';
import { OrgaMeetingsMainModule } from './pages/orga-meetings-main/orga-meetings-main.module';

@NgModule({
    declarations: [],
    imports: [CommonModule, OrgaMeetingsRoutingModule, OrgaMeetingsMainModule]
})
export class OrgaMeetingsModule {}
