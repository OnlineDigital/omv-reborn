# omv-reborn - Project Plan

> Modern Web Interface for OpenMediaVault

## 1. Project Overview

**Project Name:** omv-reborn  
**Type:** Web Application (SPA)  
**Runtime:** Bun.js + SolidJS  
**API:** WebSockets ONLY  

### Goals

- Replace OMV's dated web UI with a modern, responsive interface
- Simplify common tasks for home users while retaining power for sysadmins
- Provide real-time feedback via WebSocket events
- Maintain full compatibility with OMV's JSON-RPC backend

### Non-Goals

- Replacing OMV core functionality (this remains the engine)
- Supporting multiple OMV versions (target: OMV 6.x/7.x)
- Mobile-first (desktop primary, responsive secondary)

---

## 2. Architecture

```
┌─────────────┐     WebSocket      ┌─────────────┐
│   SolidJS   │◄──────────────────►│   Bun.js    │
│   Client    │                    │   Backend   │
└─────────────┘                    └──────┬──────┘
                                           │
                                    ┌──────▼──────┐
                                    │   OMV RPC   │
                                    │  (localhost)│
                                    └─────────────┘
```

### 2.1 Backend (Bun.js)

| Component | Responsibility |
|-----------|----------------|
| `index.ts` | HTTP server, serves static assets, WS upgrade |
| `ws-server.ts` | WebSocket connection management, message routing |
| `rpc-client.ts` | HTTP client to OMV's JSON-RPC endpoint |
| `events.ts` | Event emitters for system stats, task progress |

**OMV Connection:**
- OMV exposes RPC at `http://localhost/rpc.php` (or via nginx on port 80)
- Backend authenticates once, stores session cookie
- For now: assume anonymous or configured credentials

### 2.2 Frontend (SolidJS)

| Component | Responsibility |
|-----------|----------------|
| `App.tsx` | Router, layout, theme provider |
| `stores/` | Reactive state (system stats, user session) |
| `ws/` | WebSocket client, auto-reconnect, message queue |
| `pages/` | Page components (Dashboard, Storage, etc.) |
| `components/` | Reusable UI (Card, Button, Table, Modal) |

### 2.3 Shared Types

All TypeScript types in `shared/types.ts` — shared between client and server.

---

## 3. WebSocket API Design

### 3.1 Message Envelope

```typescript
interface WSMessage {
  type: 'request' | 'response' | 'event' | 'error';
  id: string;           // UUID for request/response pairing
  method?: string;     // RPC method name (requests)
  params?: object;     // RPC parameters
  result?: any;        // Response result
  error?: WSError;     // Error details
  progress?: number;   // 0-100 for long-running tasks
  event?: string;     // Event name (events)
  data?: any;         // Event payload
}

interface WSError {
  code: number;
  message: string;
  details?: object;
}
```

### 3.2 Request/Response Flow

```
Client                          Server
  │                                │
  │──── { type: "request",       │
  │      id: "uuid-1",           │
  │      method: "disk.list" } ──►│
  │                                │──► OMV RPC
  │                                │◄── Response
  │◄── { type: "response",       │
  │     id: "uuid-1",            │
  │     result: [...] }           │
  │                                │
```

### 3.3 Server-Sent Events (via WS)

```typescript
// Server pushes these without client request
{ type: "event", event: "system.stat", data: { cpu: 12, ram: 45, ... } }
{ type: "event", event: "task.progress", id: "task-123", progress: 67 }
{ type: "event", event: "task.complete", id: "task-123", result: {...} }
{ type: "event", event: "notification", data: { level: "warning", message: "..." } }
```

### 3.4 RPC Method Mapping

| Client Method | OMV RPC Equivalent | Description |
|---------------|-------------------|--------------|
| `disk.list` | `DiskMgmt.getList` | List all disks |
| `disk.smart` | `Smart.getData` | SMART info |
| `mount.list` | `FsTab.getAll` | Mount points |
| `share.list` | `ShareMgmt.getList` | SMB/NFS/FTP shares |
| `service.list` | `Service.getAll` | All services |
| `service.toggle` | `Service.setEnabled` | Enable/disable |
| `service.restart` | `Service.restart` | Restart service |
| `user.list` | `UserMgmt.getList` | List users |
| `user.create` | `UserMgmt.set` | Create user |
| `user.delete` | `UserMgmt.delete` | Delete user |
| `system.info` | `System.getInformation` | Hostname, version, uptime |
| `system.reboot` | `PowerManagement.reboot` | Reboot |
| `system.shutdown` | `PowerManagement.shutdown` | Shutdown |
| `network.interfaces` | `Network.getInterfaces` | List interfaces |
| `network.config` | `Network.setInterface` | Set IP (DHCP/static) |

---

## 4. Feature Specifications

### 4.1 Dashboard

**Purpose:** At-a-glance system health and quick actions

| Feature | Description |
|---------|-------------|
| **CPU Usage** | Real-time percentage, mini sparkline (last 60s) |
| **RAM Usage** | Used/Total in GB, percentage |
| **Storage Overview** | Total/Used/Available across all mounts |
| **System Health** | Green/Yellow/Red indicators for: disks, services, updates |
| **Quick Actions** | Buttons: Reboot, Shutdown, Refresh Stats |
| **Recent Activity** | Last 10 log entries (from OMV log) |
| **Service Status** | Mini list: SMB, NFS, FTP — running/stopped |

**Data Flow:**
- `system.stat` event every 5 seconds
- Initial fetch: `system.info`, `disk.list`, `service.list`

### 4.2 Storage Management

**Purpose:** Disk and filesystem administration

| Feature | Description |
|---------|-------------|
| **Disk List** | Table: Device, Model, Size, Temperature, Status |
| **Partition Table** | List partitions per disk |
| **Filesystem Usage** | Bar chart per mount point |
| **Mount Points** | List with: Path, Device, FS Type, Options, Used/Available |
| **Create Mount** | Form: Device, Path, FS Type (ext4/xfs/btrfs), Options |
| **Delete Mount** | Confirmation dialog, unmount first |
| **SMART Info** | Modal: Health, Power-On Hours, Reallocated Sectors, Temperature |
| **RAID Overview** | For OMV-managed RAID: Level, Status, Devices, Rebuild Progress |

**Edge Cases:**
- Disk in use — warn before unmount/delete
- RAID rebuild — show progress bar
- SMART unavailable — show "N/A" gracefully

### 4.3 File Shares

**Purpose:** Manage SMB/NFS/FTP shares

| Feature | Description |
|---------|-------------|
| **Share List** | Table: Name, Type (SMB/NFS/FTP), Path, Enabled, Comment |
| **Create Share** | Form: Name, Path, Type, Enabled, ACLs |
| **Edit Share** | Same form, pre-filled |
| **Toggle Share** | Quick enable/disable without edit |
| **Delete Share** | Confirmation with cascade option |
| **Permissions View** | Read-only view of current ACLs |

**Supported Share Types:**
- SMB/CIFS
- NFS (v3/v4)
- FTP/FTPS
- SFTP (if OMV plugin enabled)

### 4.4 Services

**Purpose:** Service lifecycle management

| Feature | Description |
|---------|-------------|
| **Service List** | Grid: Icon, Name, Status, Enabled on Boot, Quick Toggle |
| **Service Details** | Modal: Config fields, restart/stop/start buttons |
| **Start/Stop/Restart** | Immediate action with progress feedback |
| **Enable/Disable on Boot** | Toggle switch |
| **Config Form** | Service-specific: e.g., SMB: workgroup, browseable; SSH: port |

**Default Services:**
- SMB/CIFS
- NFS
- FTP
- SSH
- Rsync
- Snapraid (if installed)
- MergerFS (if installed)

### 4.5 Network

**Purpose:** Network interface management

| Feature | Description |
|---------|-------------|
| **Interface List** | Table: Name, Type, IP Address, Netmask, Gateway, Status |
| **Interface Details** | Modal: DHCP/Static toggle, IP fields, DNS servers |
| **Apply Changes** | Batch apply with confirmation (may disconnect) |
| **Firewall Rules** | Table: Port, Protocol, Action, Source, Enabled |
| **DNS Settings** | System DNS configuration |

**Validation:**
- Static IP: require valid IP + netmask
- Duplicate IP: warn before apply

### 4.6 Users & Groups

**Purpose:** User and group administration

| Feature | Description |
|---------|-------------|
| **User List** | Table: Username, Full Name, Email, Groups, Shell, Enabled |
| **Create User** | Form: Username, Password, Full Name, Email, Groups, Shell |
| **Edit User** | Same form, password optional |
| **Delete User** | Confirmation, warn if shared folder owner |
| **Group List** | Table: Group Name, Members (count + names) |
| **Create Group** | Form: Group Name, Members |
| **Delete Group** | Confirmation |
| **Quota Display** | Per-user usage if quotas enabled |

### 4.7 System

**Purpose:** System-level operations

| Feature | Description |
|---------|-------------|
| **System Info** | Hostname, OMV Version, Kernel, Uptime, CPU Model |
| **Update Check** | Button: Check for Updates → shows available packages |
| **Install Updates** | Progress bar, requires reboot after |
| **Backup Config** | Download OMV config.tar.gz |
| **Restore Config** | Upload + restore (with warning) |
| **Power Actions** | Reboot, Shutdown, Standby (if supported) |
| **Log Viewer** | Last 100 lines, filterable by level |

### 4.8 Notifications

**Purpose:** System alerts and history

| Feature | Description |
|---------|-------------|
| **Real-time Alerts** | Toast notifications via WebSocket |
| **Notification History** | List: Timestamp, Level (info/warning/error), Message, Read/Unread |
| **Mark as Read** | Click to mark, bulk "Mark All Read" |
| **Email Settings Display** | View current email config (SMTP, recipients) — edit via OMV |

---

## 5. UI/UX Specification

### 5.1 Layout

```
┌─────────────────────────────────────────────────────┐
│ [Logo] omv-reborn              [Theme] [User] [⚙]  │  ← Header (56px)
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Dashboard│                                          │
│ Storage  │           Main Content Area              │
│ Shares   │                                          │
│ Services │                                          │
│ Network  │                                          │
│ Users    │                                          │
│ System   │                                          │
│          │                                          │
├──────────┴──────────────────────────────────────────┤
│ Connected ● │ Last sync: 12:34:56                  │  ← Footer (32px)
└─────────────────────────────────────────────────────┘
    Sidebar (200px)
```

- **Sidebar:** Fixed left, collapsible to icons (60px)
- **Header:** Fixed top, contains branding, theme toggle, user menu
- **Content:** Scrollable, max-width 1400px centered
- **Footer:** Status bar, connection indicator

### 5.2 Theme

| Variable | Light Mode | Dark Mode |
|----------|-----------|-----------|
| Background | `#f8f9fa` | `#1a1b1e` |
| Surface | `#ffffff` | `#25262b` |
| Primary | `#228be6` | `#4dabf7` |
| Success | `#40c057` | `#51cf66` |
| Warning | `#fab005` | `#fcc419` |
| Danger | `#fa5252` | `#ff6b6b` |
| Text Primary | `#212529` | `#c1c2c5` |
| Text Secondary | `#868e96` | `#909296` |
| Border | `#dee2e6` | `#373a40` |

### 5.3 Components

| Component | States |
|-----------|--------|
| Button | default, hover, active, disabled, loading |
| Card | default, hoverable (cursor: pointer) |
| Table | default, sortable header, row hover, selected row |
| Modal | enter/leave animations, backdrop click to close |
| Toast | info, success, warning, error — auto-dismiss after 5s |
| Progress | linear, circular — determinate/indeterminate |
| Toggle | on/off with smooth transition |
| Input | default, focus, error, disabled |
| Select | dropdown with search for long lists |
| Tabs | underline style, pill style |

### 5.4 Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 640px | Sidebar hidden, hamburger menu |
| Tablet | 640-1024px | Sidebar collapsed to icons |
| Desktop | > 1024px | Full sidebar |

---

## 6. Implementation Steps

### Phase 1: Core Infrastructure (Week 1)

**Goal:** Basic server + client running with dummy data

1. Initialize Bun project with `package.json`
2. Set up TypeScript config
3. Create basic Bun HTTP server (`src/server/index.ts`)
4. Add WebSocket upgrade handler
5. Create WS server (`src/server/ws-server.ts`)
6. Set up SolidJS with Vite (`src/client/`)
7. Create basic layout (sidebar, header, content)
8. Create WS client in frontend (`src/client/ws/`)
9. Connect client to server, verify message round-trip
10. Add shared types (`src/shared/types.ts`)

**Milestone:** Client shows "Connected" status, can send/receive messages

### Phase 2: Dashboard (Week 2)

**Goal:** Real system data on dashboard

1. Create `rpc-client.ts` — connects to OMV RPC endpoint
2. Implement first RPC call: `system.info`
3. Implement `disk.list`, `service.list`
4. Add `system.stat` event emitter (polling every 5s)
5. Build Dashboard UI: CPU, RAM, Storage cards
6. Add Quick Actions: reboot, shutdown buttons
7. Connect actions to RPC calls
8. Add loading states and error handling

**Milestone:** Dashboard shows live system stats

### Phase 3: Storage & Services (Week 3)

**Goal:** Full CRUD for disks and services

1. Build Storage page: disk table with SMART
2. Build mount point management (list, create, delete)
3. Build Services page: grid of service cards
4. Implement service start/stop/restart
5. Add progress events for long-running operations
6. Implement service config forms
7. Add RAID overview (if OMV supports)

**Milestone:** Can view and manage storage/services

### Phase 4: Shares & Network (Week 4)

**Goal:** Shares and networking

1. Build Shares page: SMB/NFS/FTP table
2. Implement share CRUD (create, edit, delete, toggle)
3. Build Network page: interface list
4. Implement DHCP/static toggle
5. Add firewall rules display
6. Implement "Apply Changes" with confirmation

**Milestone:** Can manage shares and network settings

### Phase 5: Users & System (Week 5)

**Goal:** User management and system operations

1. Build Users page: user and group tables
2. Implement user CRUD
3. Implement group CRUD
4. Build System page: info, updates, backup/restore
5. Implement update check and install
6. Add log viewer

**Milestone:** Full user and system management

### Phase 6: Polish (Week 6)

**Goal:** Production-ready

1. Add notifications (real-time + history)
2. Implement theme toggle (light/dark)
3. Add keyboard shortcuts
4. Mobile responsive design
5. Error boundaries and fallback UI
6. Performance: lazy-load pages, cache responses
7. Add connection status indicator with auto-reconnect
8. Write README and deployment instructions

**Milestone:** Production deployment ready

---

## 7. Technical Constraints & Decisions

### 7.1 Authentication

- **Initial:** No auth (assumes OMV on localhost, trusted network)
- **Future:** Add JWT or session-based auth via OMV's existing auth system

### 7.2 Error Handling

- Network errors: Auto-reconnect with exponential backoff
- RPC errors: Display OMV error message to user
- Validation errors: Inline form validation before submit

### 7.3 Performance

- Frontend: SolidJS signals for fine-grained reactivity
- Backend: Cache OMV responses for 2-5 seconds to reduce load
- WebSocket: Binary messages if JSON is too large (unlikely)

### 7.4 OMV Version Compatibility

- Target: OMV 6.x (Debian 12) and OMV 7.x (Debian 13)
- OMV 5.x: May work but not tested

---

## 8. File Structure (Final)

```
omv-reborn/
├── src/
│   ├── server/
│   │   ├── index.ts          # Bun server entry
│   │   ├── ws-server.ts      # WebSocket handler
│   │   ├── rpc-client.ts     # OMV RPC client
│   │   ├── events.ts         # Event emitters
│   │   └── middlewares.ts    # Auth, logging, etc.
│   ├── client/
│   │   ├── index.tsx         # SolidJS entry
│   │   ├── App.tsx           # Router + Layout
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Storage.tsx
│   │   │   ├── Shares.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Network.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── System.tsx
│   │   │   └── Notifications.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   └── Toggle.tsx
│   │   │   └── forms/
│   │   │       ├── MountForm.tsx
│   │   │       ├── ShareForm.tsx
│   │   │       ├── ServiceConfig.tsx
│   │   │       └── UserForm.tsx
│   │   ├── stores/
│   │   │   ├── system.ts     # System stats store
│   │   │   ├── storage.ts    # Disk/mount store
│   │   │   ├── services.ts   # Services store
│   │   │   ├── session.ts    # User session
│   │   │   └── theme.ts      # Theme state
│   │   ├── ws/
│   │   │   ├── client.ts     # WS connection
│   │   │   └── messages.ts  # Message builders
│   │   └── utils/
│   │       ├── format.ts    # Human-readable formatters
│   │       └── validation.ts
│   └── shared/
│       └── types.ts         # Shared TypeScript types
├── public/
│   └── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js       # Optional: for styling
└── README.md
```

---

## 9. Dependencies

### Backend (Bun)

```json
{
  "dependencies": {
    "bun": "latest",
    "ws": "^8.16.0"
  }
}
```

### Frontend (SolidJS)

```json
{
  "dependencies": {
    "solid-js": "^1.8.0",
    "@solidjs/router": "^0.13.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-solid": "^2.9.0",
    "typescript": "^5.3.0"
  }
}
```

---

## 10. Acceptance Criteria

- [ ] Server starts on port 3000 (or env-defined)
- [ ] WebSocket connects at `ws://localhost:3000/ws`
- [ ] Dashboard displays CPU, RAM, Storage from real OMV data
- [ ] Storage page lists disks with SMART data
- [ ] Services can be started/stopped/restarted
- [ ] Shares can be created/edited/deleted
- [ ] Network interfaces display and can be configured
- [ ] Users and groups can be managed
- [ ] System info, updates, backup/restore work
- [ ] Dark/light theme toggle works
- [ ] Notifications appear in real-time
- [ ] Responsive on mobile/tablet

---

## 11. Future Enhancements (Post-MVP)

- Docker container management
- VM management (if OMV plugin)
- ZFS support (if OMV plugin)
- Two-factor authentication
- Audit logging
- Plugin management
- Certificate management (Let's Encrypt)
- WebDAV shares
- Disk encryption

---

*Plan Version: 1.0*  
*Last Updated: 2026-03-09*
