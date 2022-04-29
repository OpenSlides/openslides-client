import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParticipantPasswordRoutingModule } from './participant-password-routing.module';
import { ParticipantPasswordComponent } from './components/participant-password/participant-password.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { UserComponentsModule } from 'src/app/ui/modules/user-components';

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
