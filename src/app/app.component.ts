import { Component, ViewChild } from '@angular/core';
import { tidy, Sequential } from '@tensorflow/tfjs';

import { DrawableDirective } from './directives/drawable.directive';
import * as vis from './ml/visualization/visual-helper';

import { MnistData } from './ml/dataset/mnist-data.class';
import { buildModel } from './ml/build-model';
import { trainModel } from './ml/train-model';
import { makePrediction } from './ml/make-prediction';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(DrawableDirective) canvas: DrawableDirective;

  private trueLabels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  private data: MnistData;
  private model: Sequential;

  private status: 'NONE' | 'TRAINING' | 'DONE' = 'NONE';

  public predictedNumber = '';
  public epochs: number | null = 10;

  public async startTraining() {
    // Avoid run training again while training in process
    if (this.status === 'TRAINING') {
      return;
    }

    this.status = 'TRAINING';
    this.updateEpochs();

    // Load the data only for the 1st time, and Build model Once
    if (!this.data) {
      await this.loadData();
      this.buildSequentialModel();
    }

    this.training();
  }

  // Step 1: Load the data.
  private async loadData() {
    this.data = new MnistData();

    await this.data.load();
    // (Optional) show input example data before training
    await vis.showExamples(this.data, 20);
  }

  // Step 2: Define the architecture of the model.
  private buildSequentialModel() {
    this.model = buildModel();
    // (Optional) show built model summary
    vis.showModelSummary(this.model);
  }

  // Step 3: Train the model and monitor its performance as it trains.
  private async training() {
    await trainModel(this.epochs, this.model, this.data);

    // (Optional) show training accuracy and confusion chart
    await vis.showAccuracy(this.model, this.data, this.trueLabels);
    await vis.showConfusion(this.model, this.data, this.trueLabels);
    this.status = 'DONE';
  }

  public predict(imageData: ImageData | null) {
    // condition matched when clear button is clicked
    if (imageData === null) {
      return;
    }

    // use tidy function to help avoid memory leaks with automatic memory cleanup
    tidy(() => {
      let outputMessage = '';
      if (this.status === 'DONE' && this.model) {
        outputMessage = makePrediction(this.model, imageData);
      } else if (this.status === 'TRAINING') {
        outputMessage = 'Training, Wait...';
      } else if (this.status === 'NONE') {
        outputMessage = 'No Model Found';
      }
      this.predictedNumber = outputMessage;
    });
  }

  public clear() {
    this.predictedNumber = '';
    this.canvas.clear();
  }

  private updateEpochs() {
    // If epochs is not a number, or not existed, default to 10
    // If epochs number is greater than 100, just set to 100 to save time
    this.epochs =
      isNaN(this.epochs) || !this.epochs
        ? 10
        : this.epochs > 100
        ? 100
        : this.epochs;
  }
}
