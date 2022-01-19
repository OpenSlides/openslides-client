import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MemberService } from 'app/core/core-services/member.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MemberImportService } from 'app/management/services/member-import.service';
import { User } from 'app/shared/models/users/user';
import { memberHeadersAndVerboseNames } from 'app/site/users/base/base-user.constants';
import { BaseUserImportListComponent } from 'app/site/users/base/base-user-import-list.component';

@Component({
    selector: `os-member-import-list`,
    templateUrl: `./member-import-list.component.html`,
    styleUrls: [`./member-import-list.component.scss`]
})
export class MemberImportListComponent extends BaseUserImportListComponent implements OnInit {
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        formBuilder: FormBuilder,
        public importer: MemberImportService,
        private memberService: MemberService
    ) {
        super(componentServiceCollector, translate, importer, formBuilder, memberHeadersAndVerboseNames);
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.loadUsers();
    }

    private async loadUsers(): Promise<void> {
        try {
            const request = await this.memberService.getAllOrgaUsersModelRequest();
            this.requestModels(request, `load_users`);
        } catch (e) {
            console.log(`Error`, e);
        }
    }

    /**
     * Guess the type of the property, since
     * `const type = typeof User[property];`
     * always returns undefined
     */
    protected guessType(userProperty: keyof User): 'string' | 'number' | 'boolean' {
        const numberProperties: (keyof User)[] = [`id`, `vote_weight`];
        const booleanProperties: (keyof User)[] = [`is_physical_person`, `is_active`];
        if (numberProperties.includes(userProperty)) {
            return `number`;
        } else if (booleanProperties.includes(userProperty)) {
            return `boolean`;
        } else {
            return `string`;
        }
    }
}
