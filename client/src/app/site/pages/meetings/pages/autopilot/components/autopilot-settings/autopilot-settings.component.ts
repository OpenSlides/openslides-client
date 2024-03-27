import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';

import { BaseMeetingComponent } from '../../../../base/base-meeting.component';

@Component({
    selector: `os-autopilot-settings`,
    templateUrl: `./autopilot-settings.component.html`,
    styleUrls: [`./autopilot-settings.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutopilotSettingsComponent extends BaseMeetingComponent implements OnInit {
    public readonly autopilotContentElements: { key: string; description: string }[] = [
        { key: `title`, description: _(`Autopilot content title`) },
        { key: `list-of-speakers`, description: _(`List of speakers`) },
        { key: `moderation-note`, description: _(`Moderation note`) },
        { key: `poll-finished`, description: _(`Poll results`) },
        { key: `poll-running`, description: _(`Running poll`) },
        { key: `projector`, description: _(`Projector`) },
        { key: `speaking-times`, description: _(`Speaking times`) }
    ];

    public disabledAutopilotContentElements: { [key: string]: boolean } = {};

    public constructor(private cd: ChangeDetectorRef) {
        super();
    }

    public ngOnInit(): void {
        this.storage.get<{ [key: string]: boolean }>(`autopilot-disabled`).then(keys => {
            this.disabledAutopilotContentElements = Object.assign(
                this.autopilotContentElements.mapToObject(el => ({ [el.key]: false })),
                keys
            );
            this.cd.markForCheck();
        });
    }

    public isDisabled(key: string): boolean {
        return this.disabledAutopilotContentElements[key];
    }

    public updateDisabled(key: string, status: boolean): void {
        this.disabledAutopilotContentElements[key] = status;
        this.cd.markForCheck();
        this.storage.set(`autopilot-disabled`, this.disabledAutopilotContentElements);
    }
}
