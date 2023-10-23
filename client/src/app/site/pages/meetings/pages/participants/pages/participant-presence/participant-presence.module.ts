import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { ParticipantPresenceComponent } from './components/participant-presence/participant-presence.component';
import { ParticipantPresenceRoutingModule } from './participant-presence-routing.module';

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
