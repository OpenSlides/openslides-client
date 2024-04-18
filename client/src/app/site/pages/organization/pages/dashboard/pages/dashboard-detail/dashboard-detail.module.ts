import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MeetingTimeModule } from 'src/app/ui/modules/meeting-time/meeting-time.module';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardDetailRoutingModule } from './dashboard-detail-routing.module';

@NgModule({
    declarations: [DashboardComponent],
    imports: [
        CommonModule,
        DashboardDetailRoutingModule,
        MatCardModule,
        MatProgressSpinnerModule,
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
