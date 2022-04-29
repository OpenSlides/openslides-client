import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommitteeDetailViewComponent } from './components/committee-detail-view/committee-detail-view.component';

const routes: Routes = [
    {
        path: ``,
        component: CommitteeDetailViewComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CommitteeDetailViewRoutingModule {}
