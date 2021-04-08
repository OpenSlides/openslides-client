import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

export interface CustomTranslation {
    original: string;
    translation: string;
}

export type CustomTranslations = CustomTranslation[];

@Injectable({
    providedIn: 'root'
})
export class CustomTranslationService {
    public readonly customTranslationSubject = new BehaviorSubject<CustomTranslations>([]);
}
