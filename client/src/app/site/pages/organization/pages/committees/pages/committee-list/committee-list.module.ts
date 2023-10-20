import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChipModule } from 'src/app/ui/modules/chip';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { ListModule } from 'src/app/ui/modules/list';
import { ScrollingTableModule } from 'src/app/ui/modules/scrolling-table';

import { CommitteeListRoutingModule } from './committee-list-routing.module';
import { CommitteeListComponent } from './components/committee-list/committee-list.component';
import { CommitteeListServiceModule } from './services/committee-list-service.module';

@NgModule({
    declarations: [CommitteeListComponent],
    imports: [
        CommonModule,
        CommitteeListRoutingModule,
        CommitteeListServiceModule,
        IconContainerModule,
        ListModule,
        ScrollingTableModule,
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
