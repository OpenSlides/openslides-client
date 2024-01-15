import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/site/base/base.component';

@Component({
    selector: `os-login-wrapper`,
    templateUrl: `./login-wrapper.component.html`,
    styleUrls: [`./login-wrapper.component.scss`]
})
export class LoginWrapperComponent extends BaseComponent implements OnInit {
    /**
     * sets the title of the page
     */
    public ngOnInit(): void {
        super.setTitle(`Login`);
    }
}
