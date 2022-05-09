import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/site/base/base.component';

@Component({
    selector: `os-login-wrapper`,
    templateUrl: `./login-wrapper.component.html`,
    styleUrls: [`./login-wrapper.component.scss`]
})
export class LoginWrapperComponent extends BaseComponent implements OnInit {
    public ngOnInit(): void {
        super.setTitle(`Login`);
    }
}
