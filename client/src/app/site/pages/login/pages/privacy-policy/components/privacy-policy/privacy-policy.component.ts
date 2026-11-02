import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: `os-privacy-policy`,
    templateUrl: `./privacy-policy.component.html`,
    styleUrls: [`./privacy-policy.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PrivacyPolicyComponent {}
