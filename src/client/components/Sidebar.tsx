// Sidebar Component with NAS-PRO Design
import { Component, createSignal, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { Icon } from './Icon';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

export const Sidebar: Component = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);

  const mainNavItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: 'layout-dashboard' },
    { path: '/storage', label: 'Storage', icon: 'database' },
    { path: '/shares', label: 'File Sharing', icon: 'share-2' },
    { path: '/services', label: 'Services', icon: 'layers' },
    { path: '/network', label: 'Network', icon: 'shield-check' },
    { path: '/users', label: 'Users & Groups', icon: 'users' },
    { path: '/cron', label: 'Cron', icon: 'clock' },
    { path: '/rsync', label: 'Rsync', icon: 'refresh-cw' },
    { path: '/smart', label: 'SMART', icon: 'hard-drive' },
    { path: '/notifications', label: 'Alerts', icon: 'bell' },
    { path: '/statistics', label: 'Statistics', icon: 'bar-chart-2' },
    { path: '/packages', label: 'Packages', icon: 'package' },
    { path: '/config', label: 'Config', icon: 'settings-2' },
  ];

  const bottomNavItems: NavItem[] = [
    { path: '/settings', label: 'System Settings', icon: 'settings' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside class="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col transition-all duration-300">
        {/* Logo */}
        <div class="p-6 flex items-center gap-3">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Icon name="hard-drive" size={20} class="text-white" />
          </div>
          <span class="font-bold text-xl tracking-tight text-white">NAS-PRO</span>
        </div>

        {/* Navigation */}
        <nav class="flex-1 px-4 py-4 space-y-2 custom-scrollbar overflow-y-auto">
          {mainNavItems.map((item) => (
            <A
              href={item.path}
              class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded-xl transition-all border border-transparent"
              activeClass="bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
            >
              <Icon name={item.icon} size={20} />
              <span class="font-medium">{item.label}</span>
            </A>
          ))}

          {/* Divider */}
          <div class="pt-4 mt-4 border-t border-slate-800">
            {bottomNavItems.map((item) => (
              <A
                href={item.path}
                class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded-xl transition-all border border-transparent"
                activeClass="bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
              >
                <Icon name={item.icon} size={20} />
                <span class="font-medium">{item.label}</span>
              </A>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div class="p-4 border-t border-slate-800">
          <div class="flex items-center gap-3 px-2 py-2">
            <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <Icon name="user" size={16} class="text-slate-300" />
            </div>
            <div class="flex-1 overflow-hidden">
              <p class="text-sm font-medium truncate text-slate-200">admin_user</p>
              <p class="text-xs text-slate-500 truncate">Root Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        class="md:hidden fixed bottom-4 right-4 z-50 p-3 bg-indigo-600 rounded-full shadow-lg"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen())}
      >
        <Icon name={mobileMenuOpen() ? 'x' : 'menu'} size={24} class="text-white" />
      </button>

      {/* Mobile Sidebar Overlay */}
      <Show when={mobileMenuOpen()}>
        <div
          class="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div class="md:hidden fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
          {/* Logo */}
          <div class="p-6 flex items-center gap-3">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Icon name="hard-drive" size={20} class="text-white" />
            </div>
            <span class="font-bold text-xl tracking-tight text-white">NAS-PRO</span>
          </div>

          {/* Navigation */}
          <nav class="flex-1 px-4 py-4 space-y-2 custom-scrollbar overflow-y-auto">
            {mainNavItems.map((item) => (
              <A
                href={item.path}
                class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded-xl transition-all border border-transparent"
                activeClass="bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name={item.icon} size={20} />
                <span class="font-medium">{item.label}</span>
              </A>
            ))}

            {/* Divider */}
            <div class="pt-4 mt-4 border-t border-slate-800">
              {bottomNavItems.map((item) => (
                <A
                  href={item.path}
                  class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded-xl transition-all border border-transparent"
                  activeClass="bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon name={item.icon} size={20} />
                  <span class="font-medium">{item.label}</span>
                </A>
              ))}
            </div>
          </nav>

          {/* User Info */}
          <div class="p-4 border-t border-slate-800">
            <div class="flex items-center gap-3 px-2 py-2">
              <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <Icon name="user" size={16} class="text-slate-300" />
              </div>
              <div class="flex-1 overflow-hidden">
                <p class="text-sm font-medium truncate text-slate-200">admin_user</p>
                <p class="text-xs text-slate-500 truncate">Root Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
};
