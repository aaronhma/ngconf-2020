// DANGER ZONE: DO NOT EDIT ANYTHING IN THIS FILE!
export function createCanvasElement(
  attrs = {
    // If width and height changed, our model's prediction will
    // suffer a lot.
    width: 28,
    height: 28,
    margin: '4px'
  }
): HTMLCanvasElement {
  const { width, height, margin } = attrs;
  const canvas = document.createElement('canvas');
  canvas.width = width; // The width
  canvas.height = height; // The height
  canvas.style.margin = margin; // The margin

  return canvas;
}
