import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: `hSize`
})
export class HSize implements PipeTransform {
  public transform(bytes: number): string {
      if (bytes === 0) {
          return `0 B`;
      }
      const unitLevel = Math.floor(Math.log(bytes) / Math.log(1024));
      bytes = +(bytes / Math.pow(1024, unitLevel)).toFixed(2);
      return `${bytes} ${[`B`, `kB`, `MB`, `GB`, `TB`][unitLevel]}`;
  }
}
