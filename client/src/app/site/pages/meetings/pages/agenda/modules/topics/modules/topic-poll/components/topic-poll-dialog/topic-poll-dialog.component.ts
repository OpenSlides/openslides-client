import { Component, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslatePipe } from '@ngx-translate/core';
import { PollVisibility } from 'src/app/domain/models/poll';
import { PollUpdatePayload } from 'src/app/gateways/vote-api.service';
import { BasePollDialogComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { PollFormComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form/poll-form.component';
import { PollFormApprovalComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form-approval/poll-form-approval.component';
import { PollFormSelectionComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form-selection/poll-form-selection.component';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';

const TAB_METHOD_MAP = [`selection`, `approval`];

@Component({
    selector: `os-topic-poll-dialog`,
    templateUrl: `./topic-poll-dialog.component.html`,
    styleUrls: [`./topic-poll-dialog.component.scss`],
    imports: [
        PollFormComponent,
        PollFormApprovalComponent,
        PollFormSelectionComponent,
        MatTabsModule,
        MatDialogModule,
        MatButtonModule,
        TranslatePipe
    ]
})
export class TopicPollDialogComponent extends BasePollDialogComponent {
    public majority: string;

    private approvalForm = viewChild(PollFormApprovalComponent);
    private selectionPollForm = viewChild.required(PollFormSelectionComponent);

    public get isEVotingEnabled(): boolean {
        return this.pollService.isElectronicVotingEnabled;
    }

    public override get formsValid(): boolean {
        if (!super.formsValid) {
            return false;
        }

        return this.getSelectedMethod() === `approval`
            ? this.approvalForm().approvalForm.valid
            : this.selectionPollForm().form.valid;
    }

    public selectedTab = signal(0);

    public options = rxResource<string[], { form: UntypedFormGroup }>({
        params: () => ({ form: this.pollForm().pollForm }),
        defaultValue: [],
        stream: ({ params }) => params.form.get('options').valueChanges
    });

    private pollService = inject(PollService);

    public override submitPoll(): void {
        const formValues = this.pollForm().getValues();
        const visibility: PollVisibility = formValues?.visibility;

        const payload: PollUpdatePayload = {
            title: formValues?.title,
            method: this.getSelectedMethod(),
            method_config: this.getMethodConfig(),
            visibility,
            allow_vote_split: false
        };

        if (this.getSelectedMethod() !== `approval`) {
            payload.options = formValues.options;
            payload.option_type = `text`;
        }

        if (visibility !== PollVisibility.Manually) {
            payload.entitled_group_ids = formValues?.entitled_group_ids ?? [];
            payload.live_voting_enabled = formValues?.live_voting_enabled ?? false;
        }

        this.dialogRef.close(payload);
    }

    private getSelectedMethod(): string {
        return TAB_METHOD_MAP[this.selectedTab()];
    }

    private getMethodConfig(): unknown {
        switch (this.getSelectedMethod()) {
            case `approval`:
                return { ...this.approvalForm()?.getSerialzedForm() };
            case `selection`:
                return { ...this.selectionPollForm()?.getSerialzedForm() };
        }
        return {};
    }
}
