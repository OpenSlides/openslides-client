import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StatuteParagraphImportListComponent } from './components/statute-paragraph-import-list/statute-paragraph-import-list.component';
import { StatuteParagraphListComponent } from './components/statute-paragraph-list/statute-paragraph-list.component';

const routes: Routes = [
    { path: ``, component: StatuteParagraphListComponent, pathMatch: `full` },
    { path: `import`, component: StatuteParagraphImportListComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StatuteParagraphsRoutingModule {}
