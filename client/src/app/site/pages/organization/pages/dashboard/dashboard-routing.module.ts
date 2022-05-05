import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardMainComponent } from './pages/dashboard-main/components/dashboard-main/dashboard-main.component';

const routes: Routes = [
    {
        path: ``,
        component: DashboardMainComponent,
        children: [
            {
                path: ``,
                loadChildren: () =>
                    import(`./pages/dashboard-detail/dashboard-detail.module`).then(m => m.DashboardDetailModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule {}
