import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatGroupListRoutingModule } from './chat-group-list-routing.module';
import { ChatGroupListComponent } from './components/chat-group-list/chat-group-list.component';
import { VerticalTabGroupModule } from 'src/app/ui/modules/vertical-tab-group';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { ChatGroupDetailComponent } from './components/chat-group-detail/chat-group-detail.component';
import { ChatGroupDetailMessageComponent } from './components/chat-group-detail-message/chat-group-detail-message.component';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from 'src/app/ui/pipes';
import { ChatGroupDialogModule } from '../../modules/chat-group-dialog/chat-group-dialog.module';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

@NgModule({
    declarations: [ChatGroupListComponent, ChatGroupDetailComponent, ChatGroupDetailMessageComponent],
    imports: [
        CommonModule,
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
