import { Component } from '@angular/core';

@Component({
  selector: 'app-add-receipt',
  standalone: true,
  imports: [],
  templateUrl: './add-receipt.component.html',
  styleUrl: './add-receipt.component.scss'
})
export class AddReceiptComponent {

  selectedFile: File | null = null;
  previewUrl: any;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };

    reader.readAsDataURL(this.selectedFile as File);
  }

}