import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogComponent } from 'src/app/ui/modules/choice-dialog';
import { CommaSeparatedListingComponent } from 'src/app/ui/modules/comma-separated-listing';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';
import { ListModule } from 'src/app/ui/modules/list';

import { AgendaForwardDialogComponent } from '../../components/agenda-forward-dialog/components/agenda-forward-dialog/agenda-forward-dialog.component';
import { AgendaItemCommonServiceModule } from '../../services/agenda-item-common-service.module';
import { AgendaItemListRoutingModule } from './agenda-item-list-routing.module';
import { AgendaItemInfoDialogComponent } from './components/agenda-item-info-dialog/agenda-item-info-dialog.component';
import { AgendaItemListComponent } from './components/agenda-item-list/agenda-item-list.component';
import { AgendaItemListServiceModule } from './services/agenda-item-list-service.module';

const NG_MODULES = [
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule
];
const OS_MODULES = [
    CommaSeparatedListingComponent,
    HeadBarModule,
    ListModule,
    MeetingsComponentCollectorModule,
    IconContainerComponent,
    DirectivesModule,
    ChoiceDialogComponent,
    OpenSlidesTranslationModule.forChild(),
    AgendaForwardDialogComponent
];

@NgModule({
    declarations: [AgendaItemListComponent, AgendaItemInfoDialogComponent],
    imports: [
        CommonModule,
        AgendaItemListRoutingModule,
        MatDialogModule,
        AgendaItemListServiceModule,
        AgendaItemCommonServiceModule,
        ...NG_MODULES,
        ...OS_MODULES
    ]
})
export class AgendaItemListModule {}
