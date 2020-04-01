/**
 * A class that fetches the sprited MNIST dataset and returns shuffled batches.
 *  Each image is 28px wide 28px high and has a 1 color channel as it is a grayscale image.
 *  So the shape of each image is [28, 28, 1].
 */
import { tensor2d, util, Tensor2D } from '@tensorflow/tfjs';

export class MnistData {
  // Train dataset/Test dataset split
  // Total of 65,000 images, ~55,000 images to train the model, ~10,000 images to test the model's performance
  private NUM_DATASET_TOTAL = 65000;
  private TRAIN_TEST_RATIO = 5 / 6;
  private NUM_TRAIN_DATA = Math.floor(
    this.TRAIN_TEST_RATIO * this.NUM_DATASET_TOTAL
  );
  private NUM_TEST_DATA = this.NUM_DATASET_TOTAL - this.NUM_TRAIN_DATA;

  // Input Data source, and Target Label source
  private MNIST_IMAGES_SPRITE_PATH = 'assets/images/mnist.png';
  private MNIST_LABELS_PATH = 'assets/labels/mnist_labels_uint8';

  private IMAGE_SIZE = 784;
  private NUM_LABEL_TARGET = 10;

  // Inputs data: Images variable initialization
  private allDatasetImages: Float32Array;
  private trainImages: Float32Array;
  private testImages: Float32Array;

  // Target data: Labels variable initialization
  private allDatasetLabels: Uint8Array;
  private trainLabels: Uint8Array;
  private testLabels: Uint8Array;

  private trainIndices: Uint32Array;
  private testIndices: Uint32Array;

  public async load() {
    // Make a request for the MNIST sprited image.
    const imgRequest = this.getImgRequest();
    const [imgResponse, labelsResponse] = await Promise.all([
      imgRequest,
      fetch(this.MNIST_LABELS_PATH)
    ]);

    const datasetLabelsBuffer = await (labelsResponse as Response).arrayBuffer();
    this.allDatasetLabels = new Uint8Array(datasetLabelsBuffer);

    // `util.createShuffledIndices`: Creates a new array with randomized indicies to a given quantity.
    // Create shuffled indices into the train/test set for when we select a
    // random dataset element for training / validation.
    this.trainIndices = util.createShuffledIndices(this.NUM_TRAIN_DATA);
    this.testIndices = util.createShuffledIndices(this.NUM_TEST_DATA);

    const NUM_INPUT_INDEX = this.IMAGE_SIZE * this.NUM_TRAIN_DATA;
    const NUM_TARGET_INDEX = this.NUM_LABEL_TARGET * this.NUM_TRAIN_DATA;

    // Split images(inputs) and labels(targets) into train and test sets
    this.trainImages = this.allDatasetImages.slice(0, NUM_INPUT_INDEX);
    this.testImages = this.allDatasetImages.slice(NUM_INPUT_INDEX);
    this.trainLabels = this.allDatasetLabels.slice(0, NUM_TARGET_INDEX);
    this.testLabels = this.allDatasetLabels.slice(NUM_TARGET_INDEX);
  }

  private getImgRequest(): Promise<Response> {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    return new Promise((resolve, reject) => {
      img.crossOrigin = '';
      img.onload = () => {
        img.width = img.naturalWidth;
        img.height = img.naturalHeight;

        const datasetBytesBuffer = new ArrayBuffer(
          this.NUM_DATASET_TOTAL * this.IMAGE_SIZE * 4
        );

        const chunkSize = 5000;
        canvas.width = img.width;
        canvas.height = chunkSize;

        for (let i = 0; i < this.NUM_DATASET_TOTAL / chunkSize; i++) {
          const datasetBytesView = new Float32Array(
            datasetBytesBuffer,
            i * this.IMAGE_SIZE * chunkSize * 4,
            this.IMAGE_SIZE * chunkSize
          );
          ctx.drawImage(
            img,
            0,
            i * chunkSize,
            img.width,
            chunkSize,
            0,
            0,
            img.width,
            chunkSize
          );

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          for (let j = 0; j < imageData.data.length / 4; j++) {
            // All channels hold an equal value since the image is grayscale, so
            // just read the red channel.
            datasetBytesView[j] = imageData.data[j * 4] / 255;
          }
        }
        this.allDatasetImages = new Float32Array(datasetBytesBuffer);

        resolve();
      };

      img.src = this.MNIST_IMAGES_SPRITE_PATH;
    });
  }

  // Data has been already shuffled. shuffling and normalizing the data.
  // returns a batch of images and their labels from the test or training set
  public nextBatch(
    batch: 'TRAIN' | 'TEST' = 'TRAIN',
    batchSize = 10
  ): { inputs: Tensor2D; targets: Tensor2D } {
    const batchImagesArray = new Float32Array(batchSize * this.IMAGE_SIZE);
    const batchLabelsArray = new Uint8Array(batchSize * this.NUM_LABEL_TARGET);
    const indices = batch === 'TEST' ? this.testIndices : this.trainIndices;

    for (let i = 0; i < batchSize; i++) {
      const randomIndex = indices[i + 1];
      const imageStartIndex = randomIndex * this.IMAGE_SIZE;
      const imageEndIndex = imageStartIndex + this.IMAGE_SIZE;
      const image = this.testImages.slice(imageStartIndex, imageEndIndex);

      batchImagesArray.set(image, i * this.IMAGE_SIZE);

      const labelStartIndex = randomIndex * this.NUM_LABEL_TARGET;
      const labelEndIndex = labelStartIndex + this.NUM_LABEL_TARGET;
      const label = this.testLabels.slice(labelStartIndex, labelEndIndex);

      batchLabelsArray.set(label, i * this.NUM_LABEL_TARGET);
    }

    const inputs = tensor2d(batchImagesArray, [batchSize, this.IMAGE_SIZE]);
    const targets = tensor2d(batchLabelsArray, [
      batchSize,
      this.NUM_LABEL_TARGET
    ]);

    return { inputs, targets };
  }
}
