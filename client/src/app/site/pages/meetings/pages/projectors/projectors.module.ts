import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectorsRoutingModule } from './projectors-routing.module';
import { ProjectorMainComponent } from './components/projector-main/projector-main.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [ProjectorMainComponent],
    imports: [CommonModule, ProjectorsRoutingModule, RouterModule]
})
export class ProjectorsModule {}
