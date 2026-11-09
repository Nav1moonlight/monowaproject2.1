import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../frontend/src/App';

const container = document.getElementById('app');

if (!container) {
	throw new Error('Elemen #app tidak ditemukan.');
}

createRoot(container).render(createElement(App));