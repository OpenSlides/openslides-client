import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { DirectivesModule } from '@app/ui/directives';
import { ChipComponent } from '@app/ui/modules/chip';
import { ChoiceDialogComponent } from '@app/ui/modules/choice-dialog';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { IconContainerComponent } from '@app/ui/modules/icon-container';
import { ListModule } from '@app/ui/modules/list';
import { ScrollingTableModule } from '@app/ui/modules/scrolling-table';

import { CommitteeListRoutingModule } from './committee-list-routing.module';
import { CommitteeListComponent } from './components/committee-list/committee-list.component';
import { CommitteeListServiceModule } from './services/committee-list-service.module';

@NgModule({
    declarations: [CommitteeListComponent],
    imports: [
        CommonModule,
        CommitteeListRoutingModule,
        CommitteeListServiceModule,
        IconContainerComponent,
        ListModule,
        ScrollingTableModule,
        HeadBarModule,
        ChipComponent,
        ChoiceDialogComponent,
        OpenSlidesTranslationModule.forChild(),
        MatDividerModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        DirectivesModule
    ]
})
export class CommitteeListModule {}
