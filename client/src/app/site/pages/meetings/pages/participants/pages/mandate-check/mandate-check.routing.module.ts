import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MandateCheckMainComponent } from './components/mandate-check-main/mandate-check-main.component';

const routes: Routes = [
    {
        path: ``,
        component: MandateCheckMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                loadComponent: () =>
                    import(`./components/mandate-check-list/mandate-check-list.component`).then(
                        m => m.MandateCheckListComponent
                    )
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MandateCheckRoutingModule {}
