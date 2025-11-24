'use client';

import React, { useState, useEffect } from 'react';
import { UserEditModal } from '@/components/user-edit-modal';
import { UserEntity } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // TODO: 实现获取用户列表的API调用
      // const response = await fetch('/api/users');
      // const data = await response.json();
      // setUsers(data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: UserEntity) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      try {
        // TODO: 实现删除用户的API调用
        // await fetch(`/api/users/${id}`, { method: 'DELETE' });
        fetchUsers(); // 重新加载用户列表
      } catch (error) {
        console.error('删除用户失败:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleSaveUser = async () => {
    fetchUsers(); // 重新加载用户列表
    handleCloseModal();
  };

  return (
    <div className="users-page">
      <header className="page-header">
        <h1>用户管理</h1>
        <button className="btn btn-primary" onClick={handleAddUser}>
          添加用户
        </button>
      </header>

      {isLoading ? (
        <div className="loading">加载中...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email || '—'}</td>
                <td>{user.role}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleEditUser(user)}
                  >
                    编辑
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <UserEditModal 
          user={currentUser}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}