import {
  Directive,
  HostListener,
  ElementRef,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[appDrawable]'
})
export class DrawableDirective implements OnInit {
  public pos = { x: 0, y: 0 };
  public ctx: CanvasRenderingContext2D;
  public canvas: HTMLCanvasElement;

  @Output() newImage = new EventEmitter<ImageData | null>();

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.canvas = this.el.nativeElement;
    this.ctx = this.canvas.getContext('2d');
  }

  @HostListener('mouseup', ['$event'])
  onUp(e) {
    this.newImage.emit(this.getImgData());
  }

  @HostListener('mouseenter', ['$event'])
  onEnter(e) {
    this.setPosition(e);
  }

  @HostListener('mousedown', ['$event'])
  onMove(e) {
    this.setPosition(e);
  }

  @HostListener('mousemove', ['$event'])
  onDown(e) {
    if (e.buttons !== 1) {
      return;
    }

    this.ctx.beginPath();

    this.ctx.lineWidth = 10;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#111111';

    this.ctx.moveTo(this.pos.x, this.pos.y);
    this.setPosition(e);
    this.ctx.lineTo(this.pos.x, this.pos.y);

    this.ctx.stroke();
  }

  @HostListener('resize', ['$event'])
  onResize() {
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;
  }

  public setPosition(e) {
    this.pos.x = e.offsetX;
    this.pos.y = e.offsetY;
  }

  public clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.restore();
    this.newImage.emit(null);
  }

  public getImgData(): ImageData {
    this.ctx.drawImage(this.canvas, 0, 0, 28, 28);
    return this.ctx.getImageData(0, 0, 28, 28);
  }
}
