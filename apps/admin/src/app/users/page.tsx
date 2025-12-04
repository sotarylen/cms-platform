'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserPlus, Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { UserManagementTable } from '@/components/user-management-table';
import { UserEditModal } from '@/components/user-edit-modal';
import { PageHeader } from '@/components/layout/page-header';
import { StandardContainer } from '@/components/standard-container';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      setError(error instanceof Error ? error.message : '获取用户列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="用户管理"
        subtitle="管理系统用户和权限"
        backButton
        backHref="/settings"
      />

      <StandardContainer
        title="用户列表"
        description={`共 ${users.length} 个用户`}
        actionsRight={
          <Button onClick={handleAddUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            添加用户
          </Button>
        }
      >
        {error && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-md">
            错误: {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">加载中...</span>
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">暂无用户数据</p>
        ) : (
          <UserManagementTable users={users} onEdit={handleEditUser} />
        )}
      </StandardContainer>

      <UserEditModal
        user={editingUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}