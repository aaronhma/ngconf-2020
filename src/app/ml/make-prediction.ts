import { browser, cast, Tensor, Tensor2D, Sequential } from '@tensorflow/tfjs';

import { MnistData } from './dataset/mnist-data.class';

export function makePrediction(
  model: Sequential,
  inputData: ImageData
): string {
  // Convert the canvas pixels to TensorFlow Tensor
  let input = browser.fromPixels(inputData, 1);
  // Data preparation: remove the color dimension and normalizing pixel values
  input = input.reshape([1, 28, 28, 1] as any);
  // Convert the tensor to a new type: float32
  input = cast(input, 'float32');

  // Use pre-trained model execute the inference for the input tensor (canvas pixel)
  const output = (model.predict(input) as Tensor2D).argMax(-1);
  // Retrieve the Tensor value, and convert into a string
  return output.dataSync().toString();
}

export function doPrediction(
  model: Sequential, // Let's use a Sequential model!
  data: MnistData, // Use MNIST data.
  testDataSize = 500 // Test data size is 500
): {
  prediction: Tensor<any>;
  labels: Tensor<any>;
} {
  const testData = data.nextBatch('TEST', testDataSize);
  const inputs = testData.inputs.reshape([testDataSize, 28, 28, 1]);
  const labels = testData.targets.argMax(-1);
  // Makes sure model.predict(inputs) is a 2-dimensional Tensor
  const prediction = (model.predict(inputs) as Tensor2D).argMax(-1);

  inputs.dispose();
  return {
    prediction,
    labels
  };
}
