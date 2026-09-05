import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';

interface ApiProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: { rate: number; count: number };
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  category: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly storeName = 'Emad Uddin Mohammed Store';
  readonly selectedCategory = signal('All Products');
  readonly searchTerm = signal('');
  readonly cartCount = signal(0);
  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly products = signal<Product[]>([]);
  readonly apiCategories = signal<string[]>([]);

  readonly categories = computed(() => ['All Products', ...this.apiCategories()]);
  readonly filteredProducts = computed(() => {
    const category = this.selectedCategory();
    const term = this.searchTerm().trim().toLowerCase();
    return this.products().filter(
      (product) =>
        (category === 'All Products' || product.category === category) &&
        (!term ||
          `${product.name} ${product.description} ${product.category}`
            .toLowerCase()
            .includes(term)),
    );
  });

  ngOnInit(): void {
    this.configureSeo();
    this.loadCatalogue();
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  categoryCount(category: string): number {
    return this.products().filter((product) => product.category === category).length;
  }

  updateSearch(term: string): void {
    this.searchTerm.set(term);
  }

  addToCart(): void {
    this.cartCount.update((count) => count + 1);
  }

  private loadCatalogue(): void {
    this.http.get<ApiProduct[]>('https://fakestoreapi.com/products').subscribe({
      next: (products) => {
        this.products.set(
          products.map((product) => ({
            id: product.id,
            name: product.title,
            description: product.description,
            price: product.price,
            imageUrl: product.image,
            inStock: product.rating.count > 0,
            category: product.category,
          })),
        );
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('Products could not be loaded. Please refresh the page.');
        this.isLoading.set(false);
      },
    });

    this.http.get<string[]>('https://fakestoreapi.com/products/categories').subscribe({
      next: (categories) => this.apiCategories.set(categories),
      error: () => this.apiCategories.set([]),
    });
  }

  private configureSeo(): void {
    const pageTitle = 'Emad Uddin Mohammed Store | Mega Shopping Sale';
    const description =
      'Shop the Emad Uddin Mohammed Store Mega Shopping Sale: up to 60% off and free shipping on orders over $50.';
    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({
      name: 'keywords',
      content: 'mega shopping sale, online shopping, 60% off, free shipping, Emad Uddin Mohammed Store',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
  }
}
