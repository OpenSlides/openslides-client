import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { Permission } from 'app/core/core-services/permission';
import { ErrorComponent } from './components/error/error.component';
import { InfoComponent } from './components/info/info.component';
import { StartComponent } from './components/start/start.component';

const routes: Route[] = [
    {
        path: '',
        component: StartComponent,
        pathMatch: 'full',
        data: { basePerm: Permission.meetingCanSeeFrontpage }
    },
    {
        path: 'info',
        component: InfoComponent
    },
    {
        path: 'error',
        component: ErrorComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CommonRoutingModule {}
