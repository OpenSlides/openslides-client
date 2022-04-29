import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
// import { ChatGroupListComponent } from './components/chat-group-list/chat-group-list.component';
// import { ChatGroupDetailComponent } from './components/chat-group-detail/chat-group-detail.component';
// import { ChatGroupDialogComponent } from './components/chat-group-dialog/chat-group-dialog.component';
// import { ChatMessageComponent } from './components/chat-message/chat-message.component';

@NgModule({
    declarations: [
        /* ChatGroupListComponent, ChatGroupDetailComponent, ChatGroupDialogComponent, ChatMessageComponent */
    ],
    imports: [CommonModule, ChatRoutingModule]
})
export class ChatModule {}
