import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { GeneralUser } from 'src/app/gateways/repositories/users';
import { BaseUserImportListComponent } from 'src/app/site/base/base-user-import-list.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';

import { participantHeadersAndVerboseNames } from '../../definitions';
import { ParticipantImportService } from '../../services';

@Component({
    selector: `os-participant-import-list`,
    templateUrl: `./participant-import-list.component.html`,
    styleUrls: [`./participant-import-list.component.scss`]
})
export class ParticipantImportListComponent extends BaseUserImportListComponent {
    /**
     * Constructor for list view bases
     */
    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        formBuilder: UntypedFormBuilder,
        public override readonly importer: ParticipantImportService
    ) {
        super(componentServiceCollector, translate, importer, formBuilder, participantHeadersAndVerboseNames);
    }

    /**
     * Guess the type of the property, since
     * `const type = typeof User[property];`
     * always returns undefined
     */
    protected guessType(userProperty: keyof GeneralUser): 'string' | 'number' | 'boolean' {
        const numberProperties: (keyof GeneralUser)[] = [`id`, `vote_weight`];
        const booleanProperties: (keyof GeneralUser)[] = [
            `is_present_in_meeting_ids`,
            `is_physical_person`,
            `is_active`
        ];
        if (numberProperties.includes(userProperty)) {
            return `number`;
        } else if (booleanProperties.includes(userProperty)) {
            return `boolean`;
        } else {
            return `string`;
        }
    }
}
