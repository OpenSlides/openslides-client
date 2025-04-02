import { Component } from '@angular/core';
import { isEasterEggTime } from 'src/app/infrastructure/utils';

@Component({
    selector: `os-easter-egg`,
    templateUrl: `./easter-egg.component.html`,
    styleUrls: [`./easter-egg.component.scss`],
    standalone: false
})
export class EasterEggComponent {
    public get isEeTime(): boolean {
        return isEasterEggTime();
    }
}
