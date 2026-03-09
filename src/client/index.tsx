// SolidJS Entry Point
import { render } from 'solid-js/web';
import { App } from './App';
import '../styles.css';

// Add dark class to html element for Tailwind dark mode
document.documentElement.classList.add('dark');

const root = document.getElementById('root');

if (root) {
  render(() => <App />, root);
}
