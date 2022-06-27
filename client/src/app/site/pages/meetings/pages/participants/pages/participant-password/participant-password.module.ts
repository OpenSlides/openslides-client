import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { UserComponentsModule } from 'src/app/site/modules/user-components';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

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
