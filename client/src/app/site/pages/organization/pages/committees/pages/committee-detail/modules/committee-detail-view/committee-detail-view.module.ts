import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteeDetailViewRoutingModule } from './committee-detail-view-routing.module';
import { CommitteeDetailViewComponent } from './components/committee-detail-view/committee-detail-view.component';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { CommitteeComponentsModule } from '../../../../modules/committee-components.module';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

@NgModule({
    declarations: [CommitteeDetailViewComponent],
    imports: [
        CommonModule,
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
