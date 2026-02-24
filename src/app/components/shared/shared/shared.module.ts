import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
// import { UserListComponent } from '../../admin/users-component/user-list/user-list.component';



@NgModule({
  // declarations: [UserListComponent],
  imports: [
    CalendarModule,
    CommonModule
  ],
  exports: [CalendarModule]
})
export class SharedModule { }
