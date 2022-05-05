import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParticipantPresenceRoutingModule } from './participant-presence-routing.module';
import { ParticipantPresenceComponent } from './components/participant-presence/participant-presence.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    declarations: [ParticipantPresenceComponent],
    imports: [
        CommonModule,
        ParticipantPresenceRoutingModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ParticipantPresenceModule {}
