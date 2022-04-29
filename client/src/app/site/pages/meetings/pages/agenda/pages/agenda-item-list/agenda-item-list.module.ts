import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgendaItemListRoutingModule } from './agenda-item-list-routing.module';
import { AgendaItemListComponent } from './components/agenda-item-list/agenda-item-list.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { IconContainerModule } from 'src/app/ui/modules/icon-container/icon-container.module';
import { DirectivesModule } from 'src/app/ui/directives';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { AgendaItemListServiceModule } from './services/agenda-item-list-service.module';
import { AgendaItemCommonServiceModule } from '../../services/agenda-item-common-service.module';
import { AgendaItemInfoDialogComponent } from './components/agenda-item-info-dialog/agenda-item-info-dialog.component';
import { TagCommonServiceModule } from '../../../motions';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

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
    HeadBarModule,
    ListModule,
    MeetingsComponentCollectorModule,
    IconContainerModule,
    DirectivesModule,
    PromptDialogModule,
    OpenSlidesTranslationModule.forChild()
];

@NgModule({
    declarations: [AgendaItemListComponent, AgendaItemInfoDialogComponent],
    imports: [
        CommonModule,
        AgendaItemListRoutingModule,
        AgendaItemListServiceModule,
        AgendaItemCommonServiceModule,
        TagCommonServiceModule,
        ...NG_MODULES,
        ...OS_MODULES
    ]
})
export class AgendaItemListModule {}
