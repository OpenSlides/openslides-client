import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: `os-legal-notice`,
    templateUrl: `./legal-notice.component.html`,
    styleUrls: [`./legal-notice.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class LegalNoticeComponent {}
