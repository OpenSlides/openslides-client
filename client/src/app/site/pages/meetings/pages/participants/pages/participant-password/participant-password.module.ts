import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { UserComponentsModule } from '@app/site/modules/user-components';
import { HeadBarModule } from '@app/ui/modules/head-bar';

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
