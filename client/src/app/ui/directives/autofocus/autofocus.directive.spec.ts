import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AutofocusDirective } from './autofocus.directive';

@Component({
    template: `
        <input id="box" osAutofocus value="cyan" />
    `
})
class TestComponent {}

describe(`AutofocusDirective`, () => {
    let fixture: ComponentFixture<TestComponent>;
    let input: HTMLInputElement;

    beforeEach(() => {
        jasmine.clock().install();
        fixture = TestBed.configureTestingModule({
            declarations: [AutofocusDirective, TestComponent]
        }).createComponent(TestComponent);

        input = fixture.debugElement.query(By.css(`#box`)).nativeElement;
        spyOn(input, `focus`);
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it(`check if element gets in focus`, async () => {
        expect(input.focus).not.toHaveBeenCalled();

        fixture.detectChanges();
        jasmine.clock().tick(100000);

        expect(input.focus).toHaveBeenCalled();
    });
});
