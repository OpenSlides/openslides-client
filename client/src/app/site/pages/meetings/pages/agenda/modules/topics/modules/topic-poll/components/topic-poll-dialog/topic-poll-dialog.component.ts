import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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
import { PollService } from '@app/site/pages/meetings/modules/poll/services/poll.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: `os-topic-poll-dialog`,
    templateUrl: `./topic-poll-dialog.component.html`,
    styleUrls: [`./topic-poll-dialog.component.scss`],
    imports: [
        PollEditResultComponent,
        PollFormComponent,
        MatTabsModule,
        MatDialogModule,
        MatButtonModule,
        TranslatePipe
    ],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class TopicPollDialogComponent extends BasePollDialogComponent {
    public majority: string;

    public get isEVotingEnabled(): boolean {
        return this.pollService.isElectronicVotingEnabled;
    }

    public options = computed(() => {
        return this.pollForm().form.options().value();
    });

    private pollService = inject(PollService);

    public override methodPayload(): PollMethodPayload {
        return {
            method: this.pollForm().selectedMethod(),
            method_config: this.pollForm().methodConfig()
        };
    }

    public override optionsPayload(): PollOptionsPayload {
        if (this.pollForm().selectedMethod() === `approval`) {
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
        if (this.pollForm().selectedMethod() === `approval`) {
            options.push([{ key: `approval`, title: null }]);
        } else {
            for (const option of this.options()) {
                options.push({ key: `text-${djb2hash(option)}`, title: option });
            }
        }

        return options;
    }
}
