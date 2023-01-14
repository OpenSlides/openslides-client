import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container/icon-container.module';
import { ListModule } from 'src/app/ui/modules/list';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

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
    HeadBarModule,
    ListModule,
    MeetingsComponentCollectorModule,
    IconContainerModule,
    DirectivesModule,
    PromptDialogModule,
    ChoiceDialogModule,
    OpenSlidesTranslationModule.forChild()
];

@NgModule({
    declarations: [AgendaItemListComponent, AgendaItemInfoDialogComponent],
    imports: [
        CommonModule,
        AgendaItemListRoutingModule,
        AgendaItemListServiceModule,
        AgendaItemCommonServiceModule,
        ...NG_MODULES,
        ...OS_MODULES
    ]
})
export class AgendaItemListModule {}
