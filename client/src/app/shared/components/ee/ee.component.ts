import { Component } from '@angular/core';

@Component({
    selector: `os-ee`,
    templateUrl: `./ee.component.html`,
    styleUrls: [`./ee.component.scss`]
})
export class EeComponent {
    public get isEeTime(): boolean {
        const now = new Date();
        return now.getMonth() === 3 && now.getDate() === 1;
    }
}
