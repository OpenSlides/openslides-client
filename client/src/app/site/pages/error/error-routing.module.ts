import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ErrorMainComponent } from './components/error-main/error-main.component';

const routes: Routes = [{ path: ``, component: ErrorMainComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ErrorRoutingModule {}
