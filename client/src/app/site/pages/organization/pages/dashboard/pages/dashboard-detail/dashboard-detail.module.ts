import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardDetailRoutingModule } from './dashboard-detail-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingTimeModule } from 'src/app/ui/modules/meeting-time/meeting-time.module';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';

@NgModule({
    declarations: [DashboardComponent],
    imports: [
        CommonModule,
        DashboardDetailRoutingModule,
        MatCardModule,
        MatTooltipModule,
        MatDividerModule,
        MatIconModule,
        MatButtonModule,
        ScrollingModule,
        HeadBarModule,
        MeetingTimeModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class DashboardDetailModule {}
