import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WatchForChangesGuard } from 'src/app/site/guards/watch-for-changes.guard';

import { AgendaSortComponent } from './components/agenda-sort/agenda-sort.component';

const routes: Routes = [
    {
        path: ``,
        component: AgendaSortComponent,
        canDeactivate: [WatchForChangesGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AgendaSortRoutingModule {}
