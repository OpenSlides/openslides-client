import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WatchForChangesGuard } from 'src/app/site/guards/watch-for-changes.guard';

import { GroupListComponent } from './components/group-list/group-list.component';

const routes: Routes = [
    {
        path: ``,
        component: GroupListComponent,
        canDeactivate: [WatchForChangesGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GroupsRoutingModule {}
