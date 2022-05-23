import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TagListComponent } from './components/tag-list/tag-list.component';

const routes: Routes = [{ path: ``, component: TagListComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TagsRoutingModule {}
