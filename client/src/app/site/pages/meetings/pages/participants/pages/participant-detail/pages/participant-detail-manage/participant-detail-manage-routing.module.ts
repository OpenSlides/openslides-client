import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParticipantCreateWizardComponent } from './components/participant-create-wizard/participant-create-wizard.component';

const routes: Routes = [
    {
        path: ``,
        component: ParticipantCreateWizardComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParticipantDetailManageRoutingModule {}
