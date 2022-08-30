import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatGroupDialogComponent } from './chat-group-dialog.component';

xdescribe(`ChatGroupDialogComponent`, () => {
    let component: ChatGroupDialogComponent;
    let fixture: ComponentFixture<ChatGroupDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatGroupDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatGroupDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
