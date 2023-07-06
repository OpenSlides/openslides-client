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
    let input: any;

    beforeEach(() => {
        fixture = TestBed.configureTestingModule({
            declarations: [AutofocusDirective, TestComponent]
        }).createComponent(TestComponent);

        input = fixture.debugElement.query(By.css(`#box`)).nativeElement;
        spyOn(input, `focus`);
    });

    it(`check if element gets in focus`, async () => {
        expect(input.focus).not.toHaveBeenCalled();

        fixture.detectChanges();
        await (() => new Promise(r => setTimeout(r, 100)))();

        expect(input.focus).toHaveBeenCalled();
    });
});
