// Users Page
import { onMount, Show, For, createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { UserForm } from '../components/UserForm';
import { GroupForm } from '../components/GroupForm';
import { api, users, groups } from '../stores/system';
import type { User, Group, UserInput, GroupInput } from '../../shared/types';

export function Users() {
  const [loading, setLoading] = createSignal(false);
  const [userFormOpen, setUserFormOpen] = createSignal(false);
  const [groupFormOpen, setGroupFormOpen] = createSignal(false);
  const [selectedUser, setSelectedUser] = createSignal<User | null>(null);
  const [selectedGroup, setSelectedGroup] = createSignal<Group | null>(null);
  
  onMount(() => {
    api.getUsers();
    api.getGroups();
  });
  
  const userColumns = [
    { key: 'name', header: 'Username' },
    { key: 'uid', header: 'UID' },
    { key: 'gid', header: 'GID' },
    { key: 'shell', header: 'Shell' },
    { key: 'homedir', header: 'Home' },
    { 
      key: 'groups', 
      header: 'Groups',
      render: (u: User) => u.groups?.join(', ') || '-'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u: User) => (
        <div class="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEditUser(u)}>
            Edit
          </Button>
          {u.name !== 'root' && (
            <Button size="sm" variant="danger" onClick={() => handleDeleteUser(u)}>
              Delete
            </Button>
          )}
        </div>
      )
    },
  ];
  
  const groupColumns = [
    { key: 'name', header: 'Group Name' },
    { key: 'gid', header: 'GID' },
    { 
      key: 'members', 
      header: 'Members',
      render: (g: Group) => g.members?.join(', ') || '-'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (g: Group) => (
        <div class="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEditGroup(g)}>
            Edit
          </Button>
          {!['users', 'root', 'sudo', 'adm'].includes(g.name) && (
            <Button size="sm" variant="danger" onClick={() => handleDeleteGroup(g)}>
              Delete
            </Button>
          )}
        </div>
      )
    },
  ];
  
  // User handlers
  const openCreateUser = () => {
    setSelectedUser(null);
    setUserFormOpen(true);
  };
  
  const openEditUser = (user: User) => {
    setSelectedUser(user);
    setUserFormOpen(true);
  };
  
  const handleSaveUser = async (user: UserInput) => {
    setLoading(true);
    try {
      if (selectedUser()) {
        await api.updateUser(selectedUser()!.name, user);
      } else {
        await api.createUser(user);
      }
      setUserFormOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to save user:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.name}"?`)) return;
    
    setLoading(true);
    try {
      await api.deleteUser(user.name);
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Group handlers
  const openCreateGroup = () => {
    setSelectedGroup(null);
    setGroupFormOpen(true);
  };
  
  const openEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setGroupFormOpen(true);
  };
  
  const handleSaveGroup = async (group: GroupInput) => {
    setLoading(true);
    try {
      if (selectedGroup()) {
        await api.updateGroup(selectedGroup()!.name, group);
      } else {
        await api.createGroup(group);
      }
      setGroupFormOpen(false);
      setSelectedGroup(null);
    } catch (err) {
      console.error('Failed to save group:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteGroup = async (group: Group) => {
    if (!confirm(`Are you sure you want to delete group "${group.name}"?`)) return;
    
    setLoading(true);
    try {
      await api.deleteGroup(group.name);
    } catch (err) {
      console.error('Failed to delete group:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Users & Groups</h1>
      </div>
      
      <div class="flex justify-end gap-2">
        <Button onClick={openCreateGroup}>+ Add Group</Button>
        <Button onClick={openCreateUser}>+ Add User</Button>
      </div>
      
      <Card title="Users">
        <Show 
          when={users().length > 0}
          fallback={<p class="text-gray-400">No users found</p>}
        >
          <Table columns={userColumns} data={users()} keyField="name" />
        </Show>
      </Card>
      
      <Card title="Groups">
        <Show 
          when={groups().length > 0}
          fallback={<p class="text-gray-400">No groups found</p>}
        >
          <Table columns={groupColumns} data={groups()} keyField="name" />
        </Show>
      </Card>
      
      <UserForm
        open={userFormOpen()}
        user={selectedUser()}
        groups={groups()}
        onClose={() => setUserFormOpen(false)}
        onSave={handleSaveUser}
        loading={loading()}
      />
      
      <GroupForm
        open={groupFormOpen()}
        group={selectedGroup()}
        users={users()}
        onClose={() => setGroupFormOpen(false)}
        onSave={handleSaveGroup}
        loading={loading()}
      />
    </div>
  );
}
