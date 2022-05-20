import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { UserComponentsModule } from 'src/app/ui/modules/user-components';

import { ParticipantPasswordComponent } from './components/participant-password/participant-password.component';
import { ParticipantPasswordRoutingModule } from './participant-password-routing.module';

@NgModule({
    declarations: [ParticipantPasswordComponent],
    imports: [
        CommonModule,
        ParticipantPasswordRoutingModule,
        HeadBarModule,
        UserComponentsModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ParticipantPasswordModule {}
