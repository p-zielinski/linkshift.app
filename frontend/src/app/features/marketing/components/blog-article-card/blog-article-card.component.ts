import { CommonModule, DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { BlogArticle } from '../../blog/blog.types';

@Component({
  selector: 'app-blog-article-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, DatePipe],
  templateUrl: './blog-article-card.component.html',
  styleUrl: './blog-article-card.component.css',
})
export class BlogArticleCardComponent {
  readonly article = input.required<BlogArticle>();
}
