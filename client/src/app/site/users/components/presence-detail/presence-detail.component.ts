import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ViewUser } from '../../models/view-user';
import { BaseModelContextComponent } from '../../../base/components/base-model-context.component';
import { ComponentServiceCollector } from '../../../../core/ui-services/component-service-collector';

/**
 * This component offers an input field for user numbers, and sets/unsets the
 * 'is_present' status for the user associated with that number, giving a feedback
 * by displaying the name and the new presence status of that user.
 *
 * The component is typically directly accessed via the router link
 */
@Component({
    selector: 'os-presence-detail',
    templateUrl: './presence-detail.component.html'
})
export class PresenceDetailComponent extends BaseModelContextComponent implements OnInit {
    /**
     * The form group for the input field
     */
    public userForm: FormGroup;

    /**
     * Contains the last user entered. Is null if there is no user or the last
     * participant number has no unique valid user
     */
    public lastChangedUser: ViewUser;

    /**
     * A message if an error is thrown when toggling the presence of a user.
     * Might be `null` if there is no error.
     */
    public errorMsg: string | null = null;

    /**
     * Constructor. Subscribes to the configuration if this view should be enabled at all
     *
     * @param userRepo: UserRepositoryService for querying the users
     * @param formBuilder FormBuilder input form
     * @param operator OperatorService fetch the current user for a permission check
     * @param translate Translation service
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private userRepo: UserRepositoryService,
        private formBuilder: FormBuilder
    ) {
        super(componentServiceCollector);
    }

    /**
     * initializes the form control
     */
    public ngOnInit(): void {
        super.ngOnInit();
        this.userForm = this.formBuilder.group({
            number: ''
        });
    }

    /**
     * Triggers the user finding and updating process. The user number will be taken from the {@link userForm}.
     * Feedback will be relayed to the {@link errorMsg} and/or {@link lastChangedUser} variables
     */
    public async changePresence(): Promise<void> {
        const number = this.userForm.get('number').value;
        this.userForm.reset();
        try {
            this.errorMsg = null;
            const identifiable = (await this.userRepo.togglePresenceByNumber(number))[0];
            await this.getModelChanges({
                ids: [identifiable.id],
                viewModelCtor: ViewUser,
                fieldset: 'shortName',
                additionalFields: ['is_present_in_meeting_ids']
            });
            this.lastChangedUser = this.userRepo.getViewModel(identifiable.id);
        } catch (e) {
            this.errorMsg = _(e);
        }
    }

    /**
     * triggers the submission on enter key
     */
    public onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.changePresence();
        }
    }
}
