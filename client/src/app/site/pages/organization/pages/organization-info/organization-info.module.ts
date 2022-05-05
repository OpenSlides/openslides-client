import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationInfoRoutingModule } from './organization-info-routing.module';
import { OrganizationInfoComponent } from './components/organization-info/organization-info.component';
import { InfoModule } from 'src/app/site/modules/info';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatCardModule } from '@angular/material/card';
import { OrganizationStatisticsComponent } from './components/organization-statistics/organization-statistics.component';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
