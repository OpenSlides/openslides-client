import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TopicImportComponent } from './components/topic-import/topic-import.component';
import { TopicImportMainComponent } from './components/topic-import-main/topic-import-main.component';

const routes: Routes = [
    {
        path: ``,
        component: TopicImportMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                component: TopicImportComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TopicImportRoutingModule {}
