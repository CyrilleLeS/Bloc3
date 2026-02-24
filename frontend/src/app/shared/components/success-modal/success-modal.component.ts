import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="success-icon">✓</div>
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <button class="btn btn-primary" (click)="onClose()">Continuer</button>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 2000;
      backdrop-filter: blur(4px);
    }
    .modal-content {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      text-align: center;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      animation: slideUp 0.3s ease-out;
    }
    .success-icon {
      width: 60px; height: 60px;
      background: #4CAF50;
      color: white;
      font-size: 30px;
      line-height: 60px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
    }
    h2 { margin-bottom: 0.5rem; color: #333; }
    p { color: #666; margin-bottom: 2rem; }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class SuccessModalComponent {
  @Input() title: string = 'Succès !';
  @Input() message: string = 'Opération réussie.';
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
