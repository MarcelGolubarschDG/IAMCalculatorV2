import { Component, OnInit } from '@angular/core';
import { ItemService } from '../services/item.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  items: any[] = [];
  newItemName: string = '';

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.itemService.getItems().subscribe(data => {
      this.items = data;
    });
  }

  addItem(): void {
    if (this.newItemName.trim() === '') return;

    this.itemService.addItem(this.newItemName).subscribe(item => {
      this.items.push(item);
      this.newItemName = ''; // Eingabefeld leeren
    });
  }
}
