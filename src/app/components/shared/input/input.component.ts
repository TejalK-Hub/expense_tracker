import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent {
  @Input() label: string = '';
  @Input() type: 'text' | 'number' | 'decimal' = 'text';
  @Input() placeholder: string = '';

  value: any;

  get inputType(): string {
    return this.type === 'decimal' ? 'number' : this.type;
  }

  get step(): string | null {
    return this.type === 'decimal' ? '0.01' : null;
  }
}
