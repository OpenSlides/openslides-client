import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
    template: ''
})
export class ModelRequestor implements OnInit, OnDestroy {
    public ngOnInit(): void {
        console.log('oninit');
    }

    public ngOnDestroy(): void {
        console.log('onDestroy');
    }
}
