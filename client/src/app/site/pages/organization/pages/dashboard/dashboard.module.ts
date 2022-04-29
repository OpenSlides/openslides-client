import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardMainModule } from './pages/dashboard-main/dashboard-main.module';

@NgModule({
    declarations: [],
    imports: [CommonModule, DashboardRoutingModule, DashboardMainModule]
})
export class DashboardModule {}
