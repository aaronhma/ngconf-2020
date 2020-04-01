import { tidy, Sequential } from '@tensorflow/tfjs';

import { showTrainingStatus } from './visualization/visual-helper';

import { MnistData } from './dataset/mnist-data.class';

export function trainModel(epochs: number, model: Sequential, data: MnistData) {
  // @TODO: Experiment with these hyperparameters to get higher accuracy and lower loss;
  const BATCH_SIZE = 512;
  const TRAIN_DATA_SIZE = 5500;
  const TEST_DATA_SIZE = 1000;
  const [trainXs, trainYs] = tidy(() => {
    const d = data.nextBatch('TRAIN', TRAIN_DATA_SIZE);
    return [d.inputs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]), d.targets];
  });
  const [testXs, testYs] = tidy(() => {
    const d = data.nextBatch('TEST', TEST_DATA_SIZE);
    return [d.inputs.reshape([TEST_DATA_SIZE, 28, 28, 1]), d.targets];
  });

  return model.fit(trainXs, trainYs, {
    batchSize: BATCH_SIZE,
    validationData: [testXs, testYs],
    epochs,
    shuffle: true,
    callbacks: showTrainingStatus()
  });
}
