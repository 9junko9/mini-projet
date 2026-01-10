import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentService } from './equipment.service';
import { Equipment } from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  equipment: Equipment[] = [];
  error = '';

  // form
  name = '';
  type = 'laptop';
  owner = 'IT';

  // filters
  filterType = '';
  filterStatus = '';

  constructor(private svc: EquipmentService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.error = '';
    this.svc.list({
      type: this.filterType || undefined,
      status: this.filterStatus || undefined
    }).subscribe({
      next: (rows) => this.equipment = rows,
      error: (e) => this.error = String(e?.message ?? e)
    });
  }

  add() {
    const payload = {
      name: this.name.trim(),
      type: this.type.trim(),
      status: 'in_stock',
      owner: this.owner.trim()
    };
    if (!payload.name || !payload.type || !payload.owner) return;

    this.svc.create(payload).subscribe({
      next: () => {
        this.name = '';
        this.refresh();
      },
      error: (e) => this.error = String(e?.message ?? e)
    });
  }

  setStatus(e: Equipment, status: string) {
    this.svc.setStatus(e.id, status).subscribe({
      next: () => this.refresh(),
      error: (er) => this.error = String(er?.message ?? er)
    });
  }

  remove(e: Equipment) {
    this.svc.delete(e.id).subscribe({
      next: () => this.refresh(),
      error: (er) => this.error = String(er?.message ?? er)
    });
  }
}
