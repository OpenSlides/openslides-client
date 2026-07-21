import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { djb2hash } from '@app/infrastructure/utils';
import {
    BasePollDialogComponent,
    PollMethodPayload,
    PollOptionsPayload
} from '@app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { PollEditResultComponent } from '@app/site/pages/meetings/modules/poll/components/poll-edit-result/poll-edit-result.component';
import { PollFormComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form/poll-form.component';
import { PollFormApprovalComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form-approval/poll-form-approval.component';
import { PollFormSelectionComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form-selection/poll-form-selection.component';
import { PollService } from '@app/site/pages/meetings/modules/poll/services/poll.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

const TAB_METHOD_MAP = [`selection`, `approval`];

@Component({
    selector: `os-topic-poll-dialog`,
    templateUrl: `./topic-poll-dialog.component.html`,
    styleUrls: [`./topic-poll-dialog.component.scss`],
    imports: [
        PollEditResultComponent,
        PollFormComponent,
        PollFormApprovalComponent,
        PollFormSelectionComponent,
        MatTabsModule,
        MatDialogModule,
        MatButtonModule,
        TranslatePipe
    ],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class TopicPollDialogComponent extends BasePollDialogComponent {
    public majority: string;

    public method = `selection`;

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
            ? this.approvalForm().form.valid
            : this.selectionPollForm().form.valid;
    }

    public selectedTab = signal(0);

    public options = rxResource<string[], { form: UntypedFormGroup }>({
        params: () => ({ form: this.pollForm().pollForm }),
        defaultValue: [],
        stream: ({ params }) => params.form.get('options').valueChanges
    });

    private pollService = inject(PollService);
    private translate = inject(TranslateService);

    public constructor() {
        super();
        if (this.pollData?.config?.method) {
            this.method = this.pollData.config.method;
            this.selectedTab.set(TAB_METHOD_MAP.indexOf(this.method));
        }
    }

    public override methodPayload(): PollMethodPayload {
        return {
            method: this.getSelectedMethod(),
            method_config: this.getMethodConfig()
        };
    }

    public override optionsPayload(): PollOptionsPayload {
        if (this.getSelectedMethod() === `approval`) {
            return {};
        }

        const formValues = this.pollForm().getValues();
        return {
            options: formValues.options,
            option_type: `text`
        };
    }

    public analogPollOptions(): { key: string; title: string }[] {
        const options = [];
        if (this.getSelectedMethod() === `approval`) {
            options.push(
                { key: `yes`, title: this.translate.instant(`Yes`) },
                { key: `no`, title: this.translate.instant(`No`) }
            );

            if (this.approvalForm().form.value.allow_abstain) {
                options.push({ key: `abstain`, title: this.translate.instant(`Abstain`) });
            }
        } else {
            for (const option of this.options.value()) {
                options.push({ key: `text-${djb2hash(option)}`, title: option });
            }
        }

        return options;
    }

    public getMethodConfig(): unknown {
        switch (this.getSelectedMethod()) {
            case `approval`:
                return { ...this.approvalForm()?.getSerialzedForm() };
            case `selection`:
                return { ...this.selectionPollForm()?.getSerialzedForm() };
        }
        return {};
    }

    private getSelectedMethod(): string {
        return TAB_METHOD_MAP[this.selectedTab()];
    }
}
