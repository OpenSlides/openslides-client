import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardMainComponent } from './components/dashboard-main/dashboard-main.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [DashboardMainComponent],
    imports: [CommonModule, RouterModule]
})
export class DashboardMainModule {}
