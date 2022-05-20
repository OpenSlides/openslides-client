import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListOfSpeakersComponent } from './components/list-of-speakers/list-of-speakers.component';

const routes: Routes = [{ path: `:id`, component: ListOfSpeakersComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ListOfSpeakersRoutingModule {}
