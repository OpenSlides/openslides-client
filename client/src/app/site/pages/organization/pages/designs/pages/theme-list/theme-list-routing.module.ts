import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ThemeListComponent } from './components/theme-list/theme-list.component';

const routes: Routes = [
    {
        path: ``,
        component: ThemeListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ThemeListRoutingModule {}
