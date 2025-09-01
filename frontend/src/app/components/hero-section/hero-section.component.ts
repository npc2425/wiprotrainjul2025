import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css']
})
export class HeroSectionComponent {
  constructor(private router: Router) {}

  onShopNow(): void {
    this.router.navigate(['/products']);
  }

  onExploreCollections(): void {
    this.router.navigate(['/collections']);
  }
}
