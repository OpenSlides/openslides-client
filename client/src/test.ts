// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';

import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

import { overloadJsFunctions } from './app/infrastructure/utils/overload-js-functions';

overloadJsFunctions();

if (!window.process) {
    window.process = <any>{};
}

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback): number {
        return window.setTimeout(function () {
            callback(Date.now());
        }, 1000 / 60);
    };
}

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
