import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { InfoModule } from 'src/app/site/modules/info';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { OrganizationInfoComponent } from './components/organization-info/organization-info.component';
import { OrganizationStatisticsComponent } from './components/organization-statistics/organization-statistics.component';
import { OrganizationInfoRoutingModule } from './organization-info-routing.module';

@NgModule({
    declarations: [OrganizationInfoComponent, OrganizationStatisticsComponent],
    imports: [
        CommonModule,
        OrganizationInfoRoutingModule,
        InfoModule,
        HeadBarModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild(),
        MatCardModule,
        MatProgressBarModule
    ]
})
export class OrganizationInfoModule {}
