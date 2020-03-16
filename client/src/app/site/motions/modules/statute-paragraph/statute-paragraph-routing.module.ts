import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { StatuteParagraphImportListComponent } from './components/statute-paragraph-import-list/statute-paragraph-import-list.component';
import { StatuteParagraphListComponent } from './components/statute-paragraph-list/statute-paragraph-list.component';

const routes: Route[] = [
    { path: '', component: StatuteParagraphListComponent, pathMatch: 'full' },
    { path: 'import', component: StatuteParagraphImportListComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StatuteParagraphRoutingModule {}
