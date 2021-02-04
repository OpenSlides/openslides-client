import { Directive, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';

interface Coordinate {
    x: number;
    y: number;
}

const ZERO_COORDINATE: Coordinate = { x: 0, y: 0 };

@Directive({
    selector: '[osSwipe]'
})
export class SwipeDirective implements OnInit {
    @Output()
    public swipeLeft = new EventEmitter<void>();

    @Output()
    public swipeRight = new EventEmitter<void>();

    private touchStartCoordinate: Coordinate = ZERO_COORDINATE;
    private touchEndCoordinate: Coordinate = ZERO_COORDINATE;

    private touchStartTime = 0;
    private touchEndTime = 0;

    public constructor(private element: ElementRef<HTMLElement>) {}

    public ngOnInit(): void {
        this.element.nativeElement.addEventListener('touchstart', event => this.onTouchStart(event));
        this.element.nativeElement.addEventListener('touchend', event => this.onTouchEnd(event));
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
        if (directionX > 0) {
            this.swipeRight.emit();
        }
        if (directionX < 0) {
            this.swipeLeft.emit();
        }
    }
}
