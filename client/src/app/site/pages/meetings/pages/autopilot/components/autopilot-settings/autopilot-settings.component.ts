import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { _ } from '@ngx-translate/core';
import { first } from 'rxjs';

import { BaseMeetingComponent } from '../../../../base/base-meeting.component';
import { AutopilotService } from '../../services/autopilot.service';

@Component({
    selector: `os-autopilot-settings`,
    templateUrl: `./autopilot-settings.component.html`,
    styleUrls: [`./autopilot-settings.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AutopilotSettingsComponent extends BaseMeetingComponent implements OnInit {
    public readonly autopilotContentElements: { key: string; description: string }[] = [
        { key: `title`, description: _(`Title`) },
        { key: `list-of-speakers`, description: _(`List of speakers`) },
        { key: `moderation-note`, description: _(`Moderation note`) },
        { key: `poll-running`, description: _(`Voting`) },
        { key: `poll-finished`, description: _(`Results`) },
        { key: `projector`, description: _(`Projector`) },
        { key: `speaking-times`, description: _(`Speaking times`) }
    ];

    public disabledAutopilotContentElements: Record<string, boolean> = {};

    public constructor(
        private dialogRef: MatDialogRef<AutopilotSettingsComponent>,
        private cd: ChangeDetectorRef,
        private autopilotService: AutopilotService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.autopilotService.disabledContentElements.pipe(first()).subscribe(keys => {
            this.disabledAutopilotContentElements = Object.assign(
                this.autopilotContentElements.mapToObject(el => ({ [el.key]: false })),
                keys
            );
            this.cd.markForCheck();
        });
    }

    public isDisabled(key: string): boolean {
        return this.disabledAutopilotContentElements[key] === true;
    }

    public updateDisabled(key: string, status: boolean): void {
        this.autopilotService.updateContentElementVisibility(key, !status);
    }

    public close(): void {
        this.dialogRef.close();
    }
}
