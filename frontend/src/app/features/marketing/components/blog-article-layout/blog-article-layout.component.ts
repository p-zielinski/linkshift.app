import { CommonModule, DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { BlogArticle } from '../../blog/blog.types';

@Component({
  selector: 'app-blog-article-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, DatePipe],
  templateUrl: './blog-article-layout.component.html',
  styleUrl: './blog-article-layout.component.css',
})
export class BlogArticleLayoutComponent {
  readonly article = input.required<BlogArticle>();
}
