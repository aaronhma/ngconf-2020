export function createCanvasElement(
  attrs = {
    width: 28,
    height: 28,
    margin: '4px'
  }
): HTMLCanvasElement {
  const { width, height, margin } = attrs;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.margin = margin;

  return canvas;
}
