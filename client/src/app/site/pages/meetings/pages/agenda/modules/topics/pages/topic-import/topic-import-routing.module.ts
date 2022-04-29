import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TopicImportComponent } from './components/topic-import/topic-import.component';

const routes: Routes = [
    {
        path: ``,
        component: TopicImportComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TopicImportRoutingModule {}
