import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent implements OnInit {

constructor(
  private route: ActivatedRoute,
  private router: Router
  ) { 
    route.params.subscribe(val => {
    // put the code from `ngOnInit` here

  }); }

  ngOnInit(): void {
  }

  // nagivate fuction
  goToPage(value:any) {
    this.router.navigateByUrl(value)
  }

  
}