import { Component } from '@angular/core';
import { AuthServiceService } from '../../service/auth-service.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BackButtonComponent } from '../back-button/back-button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, BackButtonComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  constructor(private authService: AuthServiceService, private router: Router){}

  name: string = '';
  email: string = '';
  password: string = '';
  
  signup(){
    this.authService.signup(this.name, this.email, this.password).subscribe(
      {
        next: (res) => {
          console.log(res);
          this.router.navigate(['/user-dashboard']);
        }
      }
    );

  }


}
