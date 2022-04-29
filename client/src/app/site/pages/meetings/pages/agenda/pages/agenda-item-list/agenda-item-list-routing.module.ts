import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgendaItemListComponent } from './components/agenda-item-list/agenda-item-list.component';

const routes: Routes = [
    {
        path: ``,
        component: AgendaItemListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AgendaItemListRoutingModule {}
