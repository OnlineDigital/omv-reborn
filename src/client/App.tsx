// Main App with Router and Sidebar Layout
import { onMount, lazy, Suspense } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import { connectWS, connected } from './stores/system';
import { Sidebar } from './components/Sidebar';
import { Icon } from './components/Icon';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Storage = lazy(() => import('./pages/Storage').then(m => ({ default: m.Storage })));
const Services = lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const Shares = lazy(() => import('./pages/Shares').then(m => ({ default: m.Shares })));
const Network = lazy(() => import('./pages/Network').then(m => ({ default: m.Network })));
const Users = lazy(() => import('./pages/Users').then(m => ({ default: m.Users })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Cron = lazy(() => import('./pages/Cron').then(m => ({ default: m.Cron })));
const Rsync = lazy(() => import('./pages/Rsync').then(m => ({ default: m.Rsync })));
const Smart = lazy(() => import('./pages/Smart').then(m => ({ default: m.Smart })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const Statistics = lazy(() => import('./pages/Statistics').then(m => ({ default: m.Statistics })));
const Packages = lazy(() => import('./pages/Packages').then(m => ({ default: m.Packages })));
const Config = lazy(() => import('./pages/Config').then(m => ({ default: m.Config })));

function Header() {
  return (
    <header class="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md z-10">
      <div class="flex items-center gap-6">
        <div class="relative group">
          <Icon name="search" size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            class="bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all text-slate-200 placeholder:text-slate-500"
            placeholder="Search parameters..."
            type="text"
          />
        </div>
        <div class="hidden md:flex items-center gap-4 text-xs font-mono text-slate-400">
          <div class="flex items-center gap-2">
            <span class={`w-2 h-2 rounded-full ${connected() ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span>HOST: NAS-PRO-01</span>
          </div>
          <div class="h-4 w-[1px] bg-slate-700"></div>
          <div>UPTIME: 12d 4h 32m</div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <button class="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg relative transition-colors">
          <Icon name="bell" size={20} />
          <span class="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
        </button>
        <button class="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors">
          <Icon name="power" size={20} />
        </button>
      </div>
    </header>
  );
}

function Layout(props: { children: any }) {
  onMount(() => {
    connectWS();
  });

  return (
    <div class="flex h-screen overflow-hidden bg-slate-950 dark">
      <Sidebar />
      <main class="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
        <Header />
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <div class="p-8">
            <Suspense fallback={<div class="text-slate-200">Loading...</div>}>
              {props.children}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

export function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Dashboard} />
      <Route path="/storage" component={Storage} />
      <Route path="/services" component={Services} />
      <Route path="/shares" component={Shares} />
      <Route path="/network" component={Network} />
      <Route path="/users" component={Users} />
      <Route path="/cron" component={Cron} />
      <Route path="/rsync" component={Rsync} />
      <Route path="/smart" component={Smart} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/packages" component={Packages} />
      <Route path="/config" component={Config} />
      <Route path="/settings" component={Settings} />
    </Router>
  );
}
