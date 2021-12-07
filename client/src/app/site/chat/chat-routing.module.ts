import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatGroupListComponent } from './components/chat-group-list/chat-group-list.component';

const ROUTES: Routes = [
    {
        path: ``,
        component: ChatGroupListComponent,
        pathMatch: `full`
    }
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class ChatRoutingModule {}
