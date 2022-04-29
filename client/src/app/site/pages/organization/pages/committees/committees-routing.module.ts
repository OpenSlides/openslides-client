import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommitteeMainComponent } from './pages/committee-main/components/committee-main/committee-main.component';

const routes: Routes = [
    {
        path: ``,
        component: CommitteeMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                loadChildren: () =>
                    import(`./pages/committee-list/committee-list.module`).then(m => m.CommitteeListModule)
            },
            {
                path: `import`,
                loadChildren: () =>
                    import(`./pages/committee-import/committee-import.module`).then(m => m.CommitteeImportModule)
            },
            {
                path: ``,
                loadChildren: () =>
                    import(`./pages/committee-detail/committee-detail.module`).then(m => m.CommitteeDetailModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CommitteesRoutingModule {}
