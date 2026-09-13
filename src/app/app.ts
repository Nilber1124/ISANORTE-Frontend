import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Button } from './shared/components/button/button';
import { Card } from './shared/components/card/card';
import { InputField } from './shared/components/input-field/input-field';
import { Badge } from './shared/components/badge/badge';
import { Alert } from './shared/components/alert/alert';
import { Loading } from './shared/components/loading/loading';
import { Modal } from './shared/components/modal/modal';
import { SectionTitle } from './shared/components/section-title/section-title';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Button,
    Card,
    InputField,
    Badge,
    Alert,
    Loading,
    Modal,
    SectionTitle
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  isModalOpen = signal(false);

  openModal() {
    this.isModalOpen.set(true);
  }
}
