import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

@Component({
    selector: `os-participant-presence`,
    templateUrl: `./participant-presence.component.html`,
    styleUrls: [`./participant-presence.component.scss`]
})
export class ParticipantPresenceComponent implements OnInit {
    /**
     * The form group for the input field
     */
    public userForm!: UntypedFormGroup;

    /**
     * Contains the last user entered. Is null if there is no user or the last
     * participant number has no unique valid user
     */
    public lastChangedUser: ViewUser | null = null;
    public lastChangedUserPresent: boolean | null = null;

    /**
     * A message if an error is thrown when toggling the presence of a user.
     * Might be `null` if there is no error.
     */
    public errorMsg: string | null = null;

    public constructor(private userRepo: ParticipantControllerService, private formBuilder: UntypedFormBuilder) {}

    /**
     * initializes the form control
     */
    public ngOnInit(): void {
        this.userForm = this.formBuilder.group({
            number: ``
        });
    }

    /**
     * Triggers the user finding and updating process. The user number will be taken from the {@link userForm}.
     * Feedback will be relayed to the {@link errorMsg} and/or {@link lastChangedUser} variables
     */
    public async changePresence(): Promise<void> {
        const number = this.userForm.get(`number`)!.value;
        this.userForm.reset();
        try {
            this.errorMsg = null;
            this.lastChangedUser = this.userRepo.getViewModelByNumber(number)!;
            this.lastChangedUserPresent = !this.lastChangedUser?.isPresentInMeeting();
            await this.userRepo.togglePresenceByNumber(number);
        } catch (e: any) {
            this.errorMsg = _(e);
        }
    }

    /**
     * triggers the submission on enter key
     */
    public onKeyUp(event: KeyboardEvent): void {
        if (event.key === `Enter`) {
            this.changePresence();
        }
    }
}
