import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnsupportedBrowserComponent } from './components/unsupported-browser/unsupported-browser.component';

const routes: Routes = [
    {
        path: ``,
        component: UnsupportedBrowserComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UnsupportedBrowserRoutingModule {}
