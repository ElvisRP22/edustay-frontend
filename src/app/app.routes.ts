import { Routes } from '@angular/router';
import { LandingComponent } from './shared/components/landing/landing';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		component: LandingComponent,
	},
];
