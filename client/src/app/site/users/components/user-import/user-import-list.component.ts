import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { User } from 'app/shared/models/users/user';

import { BaseUserImportListComponent } from '../../base/base-user-import-list.component';
import { UserImportService } from '../../services/user-import.service';
import { headerMap, userHeadersAndVerboseNames } from '../../users.constants';

/**
 * Component for the user import list view.
 */
@Component({
    selector: `os-user-import-list`,
    templateUrl: `./user-import-list.component.html`,
    styleUrls: [`./user-import-list.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class UserImportListComponent extends BaseUserImportListComponent {
    /**
     * Constructor for list view bases
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        formBuilder: FormBuilder,
        public importer: UserImportService
    ) {
        super(componentServiceCollector, translate, importer, formBuilder, userHeadersAndVerboseNames, headerMap);
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [
                {
                    idField: `user_ids`,
                    fieldset: `shortName`
                },
                {
                    idField: `group_ids`
                }
            ]
        };
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
