import { Type } from '@angular/core';

export interface OverlayComponentType {
    attachTemplate(templateRef: any): void;
    attachComponent<C>(component: Type<C>): C;
}
