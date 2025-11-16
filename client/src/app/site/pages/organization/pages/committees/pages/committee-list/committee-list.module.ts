import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChipComponent } from 'src/app/ui/modules/chip';
import { ChoiceDialogComponent } from 'src/app/ui/modules/choice-dialog';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';
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
        IconContainerComponent,
        ListModule,
        ScrollingTableModule,
        HeadBarModule,
        ChipComponent,
        ChoiceDialogComponent,
        OpenSlidesTranslationModule.forChild(),
        MatDividerModule,
        MatMenuModule,
        MatTooltipModule,
        MatIconModule,
        MatButtonModule,
        DirectivesModule
    ]
})
export class CommitteeListModule {}
