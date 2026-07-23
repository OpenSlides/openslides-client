import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { djb2hash } from '@app/infrastructure/utils';
import { collectionFromFqid } from '@app/infrastructure/utils/transform-functions';
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
import { TranslatePipe } from '@ngx-translate/core';

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
            : this.selectionPollForm().form.valid && this.options().length > 0;
    }

    public selectedTab = signal(0);

    public options = computed(() => {
        return this.pollForm().form.options().value();
    });

    private pollService = inject(PollService);

    public constructor() {
        super();

        if (this.pollData?.config_id) {
            const collection = collectionFromFqid(this.pollData?.config_id);
            this.selectedTab.set(TAB_METHOD_MAP.indexOf(collection.replace(`poll_config_`, ``)));
        } else if (this.pollData?.config?.method) {
            this.selectedTab.set(TAB_METHOD_MAP.indexOf(this.pollData.config.method));
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
            options.push([{ key: `approval`, title: null }]);
        } else {
            for (const option of this.options()) {
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

    public getSelectedMethod(): string {
        return TAB_METHOD_MAP[this.selectedTab()];
    }
}
