import { CommonModule } from '@angular/common';
import { Component, effect, input } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SchemaTreeNode } from '../utils/openapi-schema-tree';

@Component({
  selector: 'app-schema-tree',
  standalone: true,
  imports: [CommonModule, MatTreeModule, MatButtonModule, MatIconModule],
  templateUrl: './schema-tree.component.html',
  styleUrl: './schema-tree.component.css',
})
export class SchemaTreeComponent {
  readonly rootNode = input<SchemaTreeNode | null>(null);

  readonly treeControl = new NestedTreeControl<SchemaTreeNode>((node) => node.children);
  readonly dataSource = new MatTreeNestedDataSource<SchemaTreeNode>();

  constructor() {
    effect(() => {
      const rootNode = this.rootNode();
      this.dataSource.data = rootNode ? [rootNode] : [];
      this.treeControl.collapseAll();
      if (rootNode) {
        this.treeControl.expand(rootNode);
      }
    });
  }

  hasChild = (_: number, node: SchemaTreeNode): boolean => node.children.length > 0;
}
