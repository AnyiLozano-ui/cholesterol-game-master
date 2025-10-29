import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.page.html',
  styleUrls: ['./instructions.page.scss'],
  standalone: false,
})
export class InstructionsPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToGame() {
    this.router.navigate(['/game']); 
  }

  goToHouse() {
    this.router.navigate(['/home']); 
  }

}
