import { animate, state, style, transition, trigger } from '@angular/animations';

export const fadeInOutAnim = trigger(`fadeInOut`, [
    state(
        `true`,
        style({
            opacity: 1
        })
    ),
    state(
        `false`,
        style({
            opacity: 0.2
        })
    ),
    transition(`true <=> false`, animate(`1s`))
]);
