import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { HistoryListComponent } from './components/history-list/history-list.component';
import { HistoryMainComponent } from './components/history-main/history-main.component';

/**
 * Define the routes for the history module
 */
const routes: Route[] = [
    {
        path: ``,
        component: HistoryMainComponent,
        children: [{ path: ``, pathMatch: `full`, component: HistoryListComponent }]
    }
];

/**
 * Define the routing component and setup the routes
 */
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HistoryRoutingModule {}
