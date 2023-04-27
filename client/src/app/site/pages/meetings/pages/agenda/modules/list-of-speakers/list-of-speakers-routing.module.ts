import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListOfSpeakersComponent } from './components/list-of-speakers/list-of-speakers.component';
import { ListOfSpeakersMainComponent } from './components/list-of-speakers-main/list-of-speakers-main.component';

const routes: Routes = [
    {
        path: ``,
        component: ListOfSpeakersMainComponent,
        children: [
            {
                path: `:id`,
                pathMatch: `full`,
                component: ListOfSpeakersComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ListOfSpeakersRoutingModule {}
