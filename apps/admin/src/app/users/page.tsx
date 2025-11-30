'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users as UsersIcon, UserPlus, Loader2, ArrowLeft } from 'lucide-react';
import type { User } from '@/lib/types';
import { UserManagementTable } from '@/components/user-management-table';
import { UserEditModal } from '@/components/user-edit-modal';

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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-muted-foreground mt-2">管理系统用户和权限</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              <div>
                <CardTitle>用户列表</CardTitle>
                <CardDescription>
                  共 {users.length} 个用户
                </CardDescription>
              </div>
            </div>
            <Button onClick={handleAddUser}>
              <UserPlus className="mr-2 h-4 w-4" />
              添加用户
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <UserEditModal
        user={editingUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}