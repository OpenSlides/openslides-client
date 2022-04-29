import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LegalNoticeComponent } from './components/legal-notice/legal-notice.component';

const routes: Routes = [
    {
        path: ``,
        component: LegalNoticeComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LegalNoticeRoutingModule {}
