import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ProjectorMainComponent } from './components/projector-main/projector-main.component';
import { ProjectorsRoutingModule } from './projectors-routing.module';

@NgModule({
    declarations: [ProjectorMainComponent],
    imports: [CommonModule, ProjectorsRoutingModule, RouterModule]
})
export class ProjectorsModule {}
