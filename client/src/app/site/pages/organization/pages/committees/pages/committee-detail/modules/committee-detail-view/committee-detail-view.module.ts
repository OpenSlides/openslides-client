import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { CommaSeparatedListingModule } from 'src/app/ui/modules/comma-separated-listing';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

import { CommitteeComponentsModule } from '../../../../modules/committee-components.module';
import { CommitteeDetailViewRoutingModule } from './committee-detail-view-routing.module';
import { CommitteeDetailViewComponent } from './components/committee-detail-view/committee-detail-view.component';

@NgModule({
    declarations: [CommitteeDetailViewComponent],
    imports: [
        CommonModule,
        CommaSeparatedListingModule,
        CommitteeComponentsModule,
        CommitteeDetailViewRoutingModule,
        PromptDialogModule,
        DirectivesModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatCardModule,
        MatMenuModule,
        RouterModule,
        MatDividerModule,
        MatButtonModule
    ]
})
export class CommitteeDetailViewModule {}
