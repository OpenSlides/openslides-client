import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
