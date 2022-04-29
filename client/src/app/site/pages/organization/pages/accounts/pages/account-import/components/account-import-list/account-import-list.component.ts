import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { BaseUserImportListComponent } from 'src/app/site/base/base-user-import-list.component';
import { userHeadersAndVerboseNames } from 'src/app/domain/models/users/user.constants';
import { User } from 'src/app/domain/models/users/user';
import { AccountImportService } from '../../services/account-import.service/account-import.service';
import { AccountControllerService } from '../../../../services/common/account-controller.service';

@Component({
    selector: 'os-account-import-list',
    templateUrl: './account-import-list.component.html',
    styleUrls: ['./account-import-list.component.scss']
})
export class AccountImportListComponent extends BaseUserImportListComponent implements OnInit {
    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService,
        formBuilder: FormBuilder,
        public override importer: AccountImportService,
        private accountController: AccountControllerService
    ) {
        super(componentServiceCollector, translate, importer, formBuilder, userHeadersAndVerboseNames);
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        this.loadUsers();
    }

    private async loadUsers(): Promise<void> {
        try {
            // const request = await this.accountController.getAllOrgaUsersModelRequest();
            // this.subscribe(request, `load_users`);
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
