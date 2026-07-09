import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AutofocusDirective } from './autofocus.directive';

@Component({
    template: `
        <input id="box" osAutofocus value="cyan" />
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
class TestComponent {}

describe(`AutofocusDirective`, () => {
    let fixture: ComponentFixture<TestComponent>;
    let input: HTMLInputElement;

    beforeEach(() => {
        vi.useFakeTimers();
        fixture = TestBed.configureTestingModule({
            declarations: [AutofocusDirective, TestComponent]
        }).createComponent(TestComponent);

        input = fixture.debugElement.query(By.css(`#box`)).nativeElement;
        vi.spyOn(input, `focus`).mockReturnValue(undefined);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it(`check if element gets in focus`, async () => {
        expect(input.focus).not.toHaveBeenCalled();

        fixture.detectChanges();
        vi.advanceTimersByTime(100000);

        expect(input.focus).toHaveBeenCalled();
    });
});
