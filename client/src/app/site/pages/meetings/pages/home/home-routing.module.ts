import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: ``,
        pathMatch: `full`,
        loadChildren: () => import(`./pages/start/start.module`).then(m => m.StartModule)
    },
    {
        path: `info`,
        loadChildren: () => import(`./pages/meeting-info/meeting-info.module`).then(m => m.MeetingInfoModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HomeRoutingModule {}
