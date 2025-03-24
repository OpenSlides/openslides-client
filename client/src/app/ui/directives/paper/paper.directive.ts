import { Directive, ElementRef, Input, OnInit } from '@angular/core';

const DEPTH_0 = 0;
const DEPTH_0_VALUE = `none`;
const DEPTH_1 = 1;
const DEPTH_1_VALUE = `0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)`;
const DEPTH_2 = 2;
const DEPTH_2_VALUE = `0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4)`;
const DEPTH_3 = 3;
const DEPTH_3_VALUE = `0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12), 0 3px 5px -1px rgba(0, 0, 0, 0.4)`;
const DEPTH_4 = 4;
const DEPTH_4_VALUE = `0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.4)`;
const DEPTH_5 = 5;
const DEPTH_5_VALUE = `0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.4)`;

export type Depth = typeof DEPTH_0 | typeof DEPTH_1 | typeof DEPTH_2 | typeof DEPTH_3 | typeof DEPTH_4 | typeof DEPTH_5;

/**
 * Attaches to its container element a box shadow depending on the choosed depth.
 */
@Directive({
    selector: `[osPaper]`,
    standalone: false
})
export class PaperDirective implements OnInit {
    @Input()
    public osPaper: Depth = 2;

    @Input()
    public osPaperRaise: boolean | Depth = false;

    private depthMap: { [key in Depth]: string } = {
        [DEPTH_0]: DEPTH_0_VALUE,
        [DEPTH_1]: DEPTH_1_VALUE,
        [DEPTH_2]: DEPTH_2_VALUE,
        [DEPTH_3]: DEPTH_3_VALUE,
        [DEPTH_4]: DEPTH_4_VALUE,
        [DEPTH_5]: DEPTH_5_VALUE
    };

    public constructor(private container: ElementRef<HTMLElement>) {}

    public ngOnInit(): void {
        if (!this.depthMap[this.osPaper]) {
            this.osPaper = DEPTH_2;
        }
        this.container.nativeElement.style.boxShadow = this.depthMap[this.osPaper];
        if (this.osPaperRaise || this.osPaper === DEPTH_0) {
            this.initRaiseOnHover(this.getRaiseDepth());
        }
    }

    private getRaiseDepth(): Depth {
        if (this.osPaper === DEPTH_0 || this.osPaperRaise === true) {
            return DEPTH_5;
        }
        return this.osPaperRaise as Depth;
    }

    private initRaiseOnHover(depth: Depth): void {
        this.container.nativeElement.addEventListener(`mouseenter`, () => {
            this.container.nativeElement.style.boxShadow = this.depthMap[depth];
        });
        this.container.nativeElement.addEventListener(`mouseleave`, () => {
            this.container.nativeElement.style.boxShadow = this.depthMap[this.osPaper];
        });
    }
}
