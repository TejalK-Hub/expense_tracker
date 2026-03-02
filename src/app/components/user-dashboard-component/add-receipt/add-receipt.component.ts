import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-add-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-receipt.component.html',
  styleUrl: './add-receipt.component.scss'
})
export class AddReceiptComponent {

  @Output() fileSelected = new EventEmitter<File>();
  
  selectedFile: File | null = null;
  previewUrl: any;

 onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    console.log('Selected File:', file);
  }
}


}