import { Directive, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

interface Coordinate {
    x: number;
    y: number;
}

const ZERO_COORDINATE: Coordinate = { x: 0, y: 0 };

type Constraint = 'left' | 'right';

@Directive({
    selector: '[osSwipe]'
})
export class SwipeDirective implements OnInit {
    /**
     * A constraint swiping has to begin to propagate.
     */
    @Input()
    public set swipeConstraints(constraints: Constraint | Constraint[]) {
        if (Array.isArray(constraints)) {
            this.constraints = constraints;
        } else {
            this.constraints = [constraints];
        }
    }

    @Output()
    public swipeLeft = new EventEmitter<void>();

    @Output()
    public swipeRight = new EventEmitter<void>();

    private touchStartCoordinate: Coordinate = ZERO_COORDINATE;
    private touchEndCoordinate: Coordinate = ZERO_COORDINATE;

    private touchStartTime = 0;
    private touchEndTime = 0;

    private constraints: Constraint[] = [];
    private xStartConstraintLeft: number;
    private xStartConstraintRight: number;

    public constructor(private element: ElementRef<HTMLElement>) {}

    public ngOnInit(): void {
        this.element.nativeElement.addEventListener('touchstart', event => this.onTouchStart(event));
        this.element.nativeElement.addEventListener('touchend', event => this.onTouchEnd(event));
        this.initializeConstraints();
    }

    public onTouchStart(event: TouchEvent): void {
        this.touchStartCoordinate = {
            x: event.changedTouches[0].pageX,
            y: event.changedTouches[0].pageY
        };
        this.touchStartTime = new Date().getTime();
    }

    public onTouchEnd(event: TouchEvent): void {
        this.touchEndCoordinate = {
            x: event.changedTouches[0].pageX,
            y: event.changedTouches[0].pageY
        };
        this.touchEndTime = new Date().getTime();
        this.calculateSwipe();
    }

    private calculateSwipe(): void {
        const duration = this.touchEndTime - this.touchStartTime;
        const directionX = this.touchEndCoordinate.x - this.touchStartCoordinate.x;
        const directionY = this.touchEndCoordinate.y - this.touchStartCoordinate.y;
        if (duration > 1000 || Math.abs(directionX) < 30 || Math.abs(directionX) < Math.abs(directionY * 3)) {
            return;
        }
        if (directionX > 0 && this.touchStartCoordinate.x < this.xStartConstraintLeft) {
            this.swipeRight.emit();
        }
        if (directionX < 0 && this.touchStartCoordinate.x > this.xStartConstraintRight) {
            this.swipeLeft.emit();
        }
    }

    private initializeConstraints(): void {
        this.xStartConstraintLeft = this.element.nativeElement.getBoundingClientRect().width;
        this.xStartConstraintRight = 0;
        if (this.constraints.includes('left')) {
            this.xStartConstraintLeft = 20;
        }
        if (this.constraints.includes('right')) {
            this.xStartConstraintRight = this.element.nativeElement.getBoundingClientRect().width - 20;
        }
    }
}
