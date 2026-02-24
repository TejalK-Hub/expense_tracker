import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryOption } from '../shared/category-options-drop-down-model';

@Component({
  selector: 'app-drop-down-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drop-down-button.component.html',
  styleUrl: './drop-down-button.component.scss',
})
export class DropDownButtonComponent {
  selectedCategory: string = 'Travel';

  categories: CategoryOption[] = [
    { name: 'Travel' },
    { name: 'Food' },
    { name: 'Stay' },
    { name: 'Miscellaneous' },
  ];
}
