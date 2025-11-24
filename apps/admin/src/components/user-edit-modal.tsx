'use client';

import React, { useState, useEffect } from 'react';
import { UserEntity } from '@/lib/types';

interface UserEditModalProps {
  user: UserEntity | null;
  onClose: () => void;
  onSave: () => void;
}

export function UserEditModal({ user, onClose, onSave }: UserEditModalProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email || '');
      setRole(user.role);
      setPassword('');
    } else {
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('user');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const userData = {
        username,
        email: email || undefined,
        role,
        ...(password && { password }),
      };

      if (user) {
        // 更新用户
        // await fetch(`/api/users/${user.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(userData),
        // });
      } else {
        // 创建新用户
        // await fetch('/api/users', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ ...userData, password: password || '123456' }),
        // });
      }

      onSave();
    } catch (err) {
      setError('保存用户失败');
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{user ? '编辑用户' : '添加用户'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {!user && (
            <div className="form-group">
              <label htmlFor="password">密码</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!user}
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="role">角色</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}