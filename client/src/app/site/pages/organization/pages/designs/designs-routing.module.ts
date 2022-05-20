import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DesignMainComponent } from './pages/design-main/components/design-main/design-main.component';

const routes: Routes = [
    {
        path: ``,
        component: DesignMainComponent,
        children: [
            {
                path: ``,
                loadChildren: () => import(`./pages/theme-list/theme-list.module`).then(m => m.ThemeListModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DesignsRoutingModule {}
