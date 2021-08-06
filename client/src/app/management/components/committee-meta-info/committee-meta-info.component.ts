import { Component, Input } from '@angular/core';

@Component({
    selector: 'os-committee-meta-info',
    templateUrl: './committee-meta-info.component.html',
    styleUrls: ['./committee-meta-info.component.scss']
})
export class CommitteeMetaInfoComponent {
    @Input() public icon = '';
    @Input() public title = '';
}
