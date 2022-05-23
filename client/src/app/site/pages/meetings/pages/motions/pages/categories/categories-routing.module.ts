import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WatchForChangesGuard } from 'src/app/site/guards/watch-for-changes.guard';

import { CategoryDetailComponent } from './components/category-detail/category-detail.component';
import { CategoryDetailSortComponent } from './components/category-detail-sort/category-detail-sort.component';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { CategoryListSortComponent } from './components/category-list-sort/category-list-sort.component';

const routes: Routes = [
    {
        path: ``,
        pathMatch: `full`,
        component: CategoryListComponent
    },
    {
        path: `sort`,
        component: CategoryListSortComponent,
        canDeactivate: [WatchForChangesGuard]
    },
    {
        path: `:id`,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                component: CategoryDetailComponent
            },
            {
                path: `sort`,
                component: CategoryDetailSortComponent,
                canDeactivate: [WatchForChangesGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CategoriesRoutingModule {}
