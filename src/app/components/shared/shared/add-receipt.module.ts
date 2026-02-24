import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddReceiptComponent } from '../../user-dashboard-component/add-receipt/add-receipt.component';

@NgModule({
  declarations: [AddReceiptComponent],
  imports: [CommonModule],
  exports: [AddReceiptComponent]
})
export class AddReceiptModule {}