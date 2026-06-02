// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';

import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

import { overloadJsFunctions } from './app/infrastructure/utils/overload-js-functions';

overloadJsFunctions();

if (!window.process) {
    window.process = {} as any;
}

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback): number {
        return window.setTimeout(function () {
            callback(Date.now());
        }, 1000 / 60);
    };
}

@NgModule({
    providers: [provideZoneChangeDetection()]
})
class AppTestingModule {}

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment([BrowserTestingModule, AppTestingModule], platformBrowserTesting());
