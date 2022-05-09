import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { User } from 'src/app/domain/models/users/user';
import { userHeadersAndVerboseNames } from 'src/app/domain/models/users/user.constants';
import { BaseUserImportListComponent } from 'src/app/site/base/base-user-import-list.component';

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
    public constructor(formBuilder: FormBuilder, public override readonly importer: ParticipantImportService) {
        super(formBuilder, userHeadersAndVerboseNames);
    }

    /**
     * Guess the type of the property, since
     * `const type = typeof User[property];`
     * always returns undefined
     */
    protected guessType(userProperty: keyof User): 'string' | 'number' | 'boolean' {
        const numberProperties: (keyof User)[] = [`id`, `vote_weight`];
        const booleanProperties: (keyof User)[] = [`is_present_in_meeting_ids`, `is_physical_person`, `is_active`];
        if (numberProperties.includes(userProperty)) {
            return `number`;
        } else if (booleanProperties.includes(userProperty)) {
            return `boolean`;
        } else {
            return `string`;
        }
    }
}
