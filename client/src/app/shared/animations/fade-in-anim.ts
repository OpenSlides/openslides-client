import { animate, style, transition, trigger } from '@angular/animations';

const fadeIn = [style({ height: 0, opacity: 0 }), animate('600ms ease')];
const fadeOut = [
    style({ height: '*', opacity: 1 }),
    animate(
        '600ms ease',
        style({
            height: 0,
            opacity: 0
        })
    )
];

export const fadeInAnim = trigger('fadeIn', [transition(':enter', fadeIn), transition(':leave', fadeOut)]);
