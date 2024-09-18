import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AmendmentCreateWizardComponent } from './components/amendment-create-wizard/amendment-create-wizard.component';
import { MotionFormComponent } from './components/motion-form/motion-form.component';

const routes: Routes = [
    { path: `:id/create-amendment`, component: AmendmentCreateWizardComponent },
    { path: `:id/edit`, component: MotionFormComponent },
    { path: `new`, component: MotionFormComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MotionFormRoutingModule {}
