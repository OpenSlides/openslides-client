import { Component, OnInit } from '@angular/core';

import { BaseComponent } from 'app/site/base/components/base.component';

@Component({
    selector: 'os-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss']
})
export class InfoComponent extends BaseComponent implements OnInit {
    public ngOnInit(): void {
        super.setTitle('Information');
    }
}
