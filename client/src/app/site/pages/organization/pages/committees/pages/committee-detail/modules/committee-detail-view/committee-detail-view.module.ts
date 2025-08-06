import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { CommaSeparatedListingComponent } from 'src/app/ui/modules/comma-separated-listing';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { HeadToolbarComponent } from 'src/app/ui/modules/head-toolbar/head-toolbar.component';
import { ListModule } from 'src/app/ui/modules/list';

import { IconContainerComponent } from '../../../../../../../../../ui/modules/icon-container/icon-container.component';
import { CommitteeComponentsModule } from '../../../../modules/committee-components.module';
import { CommitteeListServiceModule } from '../../../committee-list/services/committee-list-service.module';
import { CommitteeDetailViewRoutingModule } from './committee-detail-view-routing.module';
import { CommitteeDetailViewComponent } from './components/committee-detail-view/committee-detail-view.component';

@NgModule({
    declarations: [CommitteeDetailViewComponent],
    imports: [
        CommonModule,
        CommaSeparatedListingComponent,
        CommitteeComponentsModule,
        CommitteeDetailViewRoutingModule,
        CommitteeListServiceModule,
        DirectivesModule,
        HeadBarModule,
        HeadToolbarComponent,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatCardModule,
        MatMenuModule,
        RouterModule,
        MatDividerModule,
        MatButtonModule,
        ListModule,
        MatTabsModule,
        IconContainerComponent
    ]
})
export class CommitteeDetailViewModule {}
