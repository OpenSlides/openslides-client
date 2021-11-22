import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatGroupDetailComponent } from './components/chat-group-detail/chat-group-detail.component';
import { ChatGroupDialogComponent } from './components/chat-group-dialog/chat-group-dialog.component';
import { ChatGroupListComponent } from './components/chat-group-list/chat-group-list.component';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';

@NgModule({
    imports: [CommonModule, SharedModule, ChatRoutingModule],
    declarations: [ChatGroupListComponent, ChatGroupDialogComponent, ChatGroupDetailComponent, ChatMessageComponent]
})
export class ChatModule {}
