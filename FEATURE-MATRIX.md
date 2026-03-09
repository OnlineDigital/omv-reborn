# OMV Reborn - Feature Matrix

## Build & Runtime Status

| Status | Description |
|--------|-------------|
| ✅ Build | Vite builds successfully (43 modules) |
| ✅ Runtime | Server starts without errors on port 3001 |

---

## Feature Categories

### Dashboard
| Feature | Status | Notes |
|---------|--------|-------|
| System Info Display | ✅ Complete | Hostname, version, uptime |
| CPU Usage | ✅ Complete | Percentage + load average |
| Memory Usage | ✅ Complete | Used/total with percentage |
| Storage Usage | ✅ Complete | Disk usage with percentage |
| Quick Actions (Reboot/Shutdown) | ✅ Complete | With confirmation modals |
| Quick Services Panel | ✅ Complete | Start/stop from dashboard |

### Storage
| Feature | Status | Notes |
|---------|--------|-------|
| Disk List | ✅ Complete | Device, model, size, serial |
| Mount Points List | ✅ Complete | Device, path, type, options |
| Filesystems | ⚠️ Partial | RPC method exists, not displayed in UI |

### Services (SMB, NFS, SSH)
| Feature | Status | Notes |
|---------|--------|-------|
| Service List | ✅ Complete | Shows SMB, NFS, SSH |
| Start/Stop Service | ✅ Complete | Toggle running state |
| Enable/Disable Service | ✅ Complete | Toggle enabled state |

### Shares
| Feature | Status | Notes |
|---------|--------|-------|
| Share List | ✅ Complete | Shows SMB and NFS shares |
| Create Share | ✅ Complete | Form with type, name, path, comment, public flag |
| Edit Share | ✅ Complete | Pre-populated form |
| Delete Share | ✅ Complete | With confirmation |

### Network
| Feature | Status | Notes |
|---------|--------|-------|
| Interface List | ✅ Complete | Shows all network interfaces |
| Interface Details | ✅ Complete | IP, netmask, gateway, MAC, DNS, status flags |
| Configure Interface | ✅ Complete | DHCP/Static IP with validation |
| DNS Configuration | ✅ Complete | Per-interface DNS servers |

### Users & Groups
| Feature | Status | Notes |
|---------|--------|-------|
| User List | ✅ Complete | Username, UID, GID, shell, home, groups |
| Create User | ✅ Complete | Username, password, email, shell, groups |
| Edit User | ✅ Complete | Update user properties |
| Delete User | ✅ Complete | With confirmation (excludes root) |
| Group List | ✅ Complete | Group name, GID, members |
| Create Group | ✅ Complete | Group name, members |
| Edit Group | ✅ Complete | Update members |
| Delete Group | ✅ Complete | With confirmation (excludes system groups) |

### System
| Feature | Status | Notes |
|---------|--------|-------|
| System Information | ✅ Complete | Hostname, version, distro, kernel, arch, uptime |
| Reboot | ✅ Complete | With confirmation modal |
| Shutdown | ✅ Complete | With confirmation modal |

---

## Additional Features

| Feature | Status | Notes |
|---------|--------|-------|
| Cron Jobs | ✅ Complete | UI for viewing/managing cron jobs, create/edit/delete/schedule |
| Rsync Jobs | ✅ Complete | UI for managing rsync jobs, create/edit/delete/run |
| SMART Monitoring | ✅ Complete | Disk health interface, SMART attributes, device selection |
| Notifications | ✅ Complete | Notifications UI, send/view notifications, filtering |
| RRD Statistics | ✅ Complete | Charts for CPU, memory, disk, network over time |
| APT/Package Management | ✅ Complete | Package update UI, upgrade functionality, settings |
| Config Management | ✅ Complete | Config UI, JSON editor, export/import, apply changes |
| SSH Settings | ⚠️ Partial | RPC methods exist, basic SSH service toggle in Services |

---

## Summary

| Category | Complete | Partial | Not Implemented |
|----------|----------|---------|-----------------|
| Dashboard | 6 | 0 | 0 |
| Storage | 2 | 1 | 0 |
| Services | 3 | 0 | 0 |
| Shares | 4 | 0 | 0 |
| Network | 4 | 0 | 0 |
| Users & Groups | 8 | 0 | 0 |
| System | 3 | 0 | 0 |
| Additional | 7 | 1 | 0 |
| **Total** | **37** | **2** | **0** |

**Overall: 95% Complete** (37/39 features fully implemented)

---

## RPC Client Coverage

The `rpc-client.ts` implements real OMV 7 RPC methods including:
- Session management
- System (info, stats, reboot, shutdown)
- Storage (disks, filesystems, mount points)
- Services (SMB, NFS, SSH)
- Shares (SMB, NFS)
- Network (interfaces, settings)
- Users & Groups
- Cron, Rsync, SMART, Notifications
- APT package management
- RRD statistics
- Configuration management
