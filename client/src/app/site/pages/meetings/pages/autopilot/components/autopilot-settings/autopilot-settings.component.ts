import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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
        { key: `list-of-speakers`, description: _(`List of speakers`) },
        { key: `moderation-note`, description: _(`Moderation note`) },
        { key: `poll-result`, description: _(`Poll results`) },
        { key: `poll-running`, description: _(`Running poll`) },
        { key: `poll-votable`, description: _(`Votable Poll`) },
        { key: `projector`, description: _(`Projector`) },
        { key: `speaking-times`, description: _(`Speaking times`) }
    ];

    public disabledAutopilotContentElements: string[] = [];

    public constructor() {
        super();
    }

    public ngOnInit(): void {
        this.storage
            .get<string[]>(`autopilot-disabled`)
            .then(keys => (this.disabledAutopilotContentElements = keys || []));
    }

    public isDisabled(key: string): boolean {
        return this.disabledAutopilotContentElements.indexOf(key) !== -1;
    }

    public setDisabled(key: string, status: unknown): void {
        console.log(key, status);
    }
}
