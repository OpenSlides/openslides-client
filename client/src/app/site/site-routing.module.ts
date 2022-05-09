import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { SiteWrapperComponent } from './modules/site-wrapper/components/site-wrapper/site-wrapper.component';

const routes: Routes = [
    {
        path: `login`,
        loadChildren: () => import(`./pages/login/login.module`).then(m => m.LoginModule)
    },
    {
        path: ``,
        component: SiteWrapperComponent,
        children: [
            {
                path: ``,
                loadChildren: () => import(`./pages/organization/organization.module`).then(m => m.OrganizationModule),
                canActivateChild: [AuthGuard]
            },
            {
                path: `:meetingId`,
                loadChildren: () => import(`./pages/meetings/meetings.module`).then(m => m.MeetingsModule),
                canActivate: [AuthGuard],
                canActivateChild: [AuthGuard]
            }
        ]
    },
    { path: `**`, redirectTo: `` }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SiteRoutingModule {}
