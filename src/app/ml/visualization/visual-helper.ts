import { tidy, browser, Tensor3D, Sequential } from '@tensorflow/tfjs';
import {
  visor,
  show,
  metrics,
  render,
  ConfusionMatrixOptions
} from '@tensorflow/tfjs-vis';

import { doPrediction } from '../make-prediction';
import { MnistData } from '../dataset/mnist-data.class';
import { createCanvasElement } from '../../utils/canvas-helper';

export async function showExamples(data: MnistData, exampleNum = 10) {
  // Create a container in the visor
  const surface = visor().surface({
    name: 'Input Data Examples',
    tab: 'Input Data'
  });

  // Get the examples from TRAIN
  const { inputs, targets } = data.nextBatch('TEST', exampleNum);
  const [numExamples, IMAGE_SIZE] = inputs.shape;

  // Create a canvas element to render each example
  for (let i = 0; i < numExamples; i++) {
    const canvas = createCanvasElement();
    // `tidy` to avoid memory leaks for automatic memory cleanup.
    const imageTensor: Tensor3D = tidy(() => {
      // Reshape the image to 28px wide, 28px high and 1 color channel (grayscale)
      // `tensor.slice(begin, size)` https://js.tensorflow.org/api/latest/#slice
      return inputs.slice([i, 0], [1, IMAGE_SIZE]).reshape([28, 28, 1]);
    });

    // Draws a `Tensor` of pixel values to a byte array or optionally a canvas.
    await browser.toPixels(imageTensor, canvas);
    surface.drawArea.appendChild(canvas);

    // Disposes all Tensors found within the provided object.
    imageTensor.dispose();
  }
}

export function showModelSummary(model: Sequential) {
  show.modelSummary({ name: 'Model Architecture' }, model);
}

export function showTrainingStatus() {
  const metricsList = ['loss', 'val_loss', 'acc', 'val_acc'];
  const container = {
    name: 'Model Training',
    styles: { height: '1000px' }
  };

  return show.fitCallbacks(container, metricsList);
}

export async function showAccuracy(
  model: Sequential,
  data: MnistData,
  trueLabels: string[]
) {
  const { prediction, labels } = doPrediction(model, data);
  const classAccuracy = await metrics.perClassAccuracy(labels, prediction);
  const container = { name: 'Accuracy', tab: 'Evaluation' };
  show.perClassAccuracy(container, classAccuracy, trueLabels);

  labels.dispose();
}

export async function showConfusion(
  model: Sequential,
  data: MnistData,
  trueLabels: string[]
) {
  const { prediction, labels } = doPrediction(model, data);
  const confusionMatrix = await metrics.confusionMatrix(labels, prediction);
  const container = { name: 'Confusion Matrix', tab: 'Evaluation' };
  render.confusionMatrix(
    container,
    { values: confusionMatrix },
    trueLabels as ConfusionMatrixOptions
  );

  labels.dispose();
}
