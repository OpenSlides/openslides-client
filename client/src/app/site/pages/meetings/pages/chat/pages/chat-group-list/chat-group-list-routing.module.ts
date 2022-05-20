import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatGroupListComponent } from './components/chat-group-list/chat-group-list.component';

const routes: Routes = [
    {
        path: ``,
        component: ChatGroupListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ChatGroupListRoutingModule {}
