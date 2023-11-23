import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { CommaSeparatedListingModule } from 'src/app/ui/modules/comma-separated-listing';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { VerticalTabGroupModule } from 'src/app/ui/modules/vertical-tab-group';
import { PipesModule } from 'src/app/ui/pipes';

import { ChatGroupDialogModule } from '../../modules/chat-group-dialog/chat-group-dialog.module';
import { ChatGroupListRoutingModule } from './chat-group-list-routing.module';
import { ChatGroupDetailComponent } from './components/chat-group-detail/chat-group-detail.component';
import { ChatGroupDetailMessageComponent } from './components/chat-group-detail-message/chat-group-detail-message.component';
import { ChatGroupDetailMessageFormComponent } from './components/chat-group-detail-message-form/chat-group-detail-message-form.component';
import { ChatGroupListComponent } from './components/chat-group-list/chat-group-list.component';

@NgModule({
    declarations: [
        ChatGroupListComponent,
        ChatGroupDetailComponent,
        ChatGroupDetailMessageComponent,
        ChatGroupDetailMessageFormComponent
    ],
    imports: [
        CommonModule,
        CommaSeparatedListingModule,
        ChatGroupListRoutingModule,
        ChatGroupDialogModule,
        PipesModule,
        IconContainerModule,
        VerticalTabGroupModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild(),
        MatBadgeModule,
        MatIconModule,
        MatInputModule,
        MatTooltipModule,
        MatMenuModule,
        MatFormFieldModule,
        MatButtonModule,
        MatCardModule,
        ScrollingModule,
        ReactiveFormsModule
    ]
})
export class ChatGroupListModule {}
