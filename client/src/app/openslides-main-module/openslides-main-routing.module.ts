import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: ``,
        loadChildren: () => import(`../site/site.module`).then(m => m.SiteModule)
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, initialNavigation: `disabled` })],
    exports: [RouterModule]
})
export class OpenSlidesMainRoutingModule {}
