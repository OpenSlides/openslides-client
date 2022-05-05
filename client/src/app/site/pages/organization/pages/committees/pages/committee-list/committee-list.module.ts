import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteeListRoutingModule } from './committee-list-routing.module';
import { CommitteeListComponent } from './components/committee-list/committee-list.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatButtonModule } from '@angular/material/button';
import { ListModule } from 'src/app/ui/modules/list';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ChipModule } from 'src/app/ui/modules/chip';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { CommitteeListServiceModule } from './services/committee-list-service.module';

@NgModule({
    declarations: [CommitteeListComponent],
    imports: [
        CommonModule,
        CommitteeListRoutingModule,
        CommitteeListServiceModule,
        IconContainerModule,
        ListModule,
        HeadBarModule,
        ChipModule,
        ChoiceDialogModule,
        OpenSlidesTranslationModule.forChild(),
        MatDividerModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        DirectivesModule
    ]
})
export class CommitteeListModule {}
