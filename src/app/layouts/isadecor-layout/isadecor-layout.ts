import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from './footer/footer';
import { Navbar } from './navbar/navbar';

@Component({
  selector: 'app-isadecor-layout',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './isadecor-layout.html',
  styleUrl: './isadecor-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsadecorLayout {}