import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MediafileListComponent } from './components/mediafile-list/mediafile-list.component';

const routes: Routes = [
    {
        path: ``,
        component: MediafileListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MediafileListRoutingModule {}
