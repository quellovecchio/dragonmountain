import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({ selector: '[parallaxLayer]' })
export class ParallaxLayerDirective implements OnInit, OnDestroy {
  @Input('parallaxLayer') depth: number = 1;

  private card: HTMLElement | null = null;
  private boundMove!: (e: MouseEvent) => void;
  private boundLeave!: () => void;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.card = this.el.nativeElement.parentElement;
    if (!this.card) return;

    this.boundMove = (e: MouseEvent) => {
      const rect = this.card!.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      const x = dx * this.depth * 6;
      const y = dy * this.depth * 6;
      this.el.nativeElement.style.transition = 'transform 0.08s ease-out';
      this.el.nativeElement.style.transform = `translate(${x}px, ${y}px)`;
    };

    this.boundLeave = () => {
      this.el.nativeElement.style.transition = 'transform 0.4s ease-out';
      this.el.nativeElement.style.transform = 'translate(0, 0)';
    };

    this.card.addEventListener('mousemove', this.boundMove);
    this.card.addEventListener('mouseleave', this.boundLeave);
  }

  ngOnDestroy(): void {
    if (this.card) {
      this.card.removeEventListener('mousemove', this.boundMove);
      this.card.removeEventListener('mouseleave', this.boundLeave);
    }
  }
}
