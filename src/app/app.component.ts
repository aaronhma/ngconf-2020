import { Component, ViewChild } from '@angular/core';

import { DrawableDirective } from './directives/drawable.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(DrawableDirective) canvas: DrawableDirective;

  public predictedNumber = '';
  public epochs: number | null = 10;

  public async startTraining() {}

  public predict(imageData: ImageData | null) {}

  public clear() {
    this.predictedNumber = '';
    this.canvas.clear();
  }
}
