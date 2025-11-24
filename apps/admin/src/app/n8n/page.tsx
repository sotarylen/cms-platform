'use client';

import React, { useState, useEffect } from 'react';

interface N8nInstance {
  id: number;
  name: string;
  url: string;
  enabled: boolean;
  createdAt: string;
}

export default function N8nIntegrationPage() {
  const [instances, setInstances] = useState<N8nInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<N8nInstance | null>(null);
  const [testResults, setTestResults] = useState<Record<number, { loading: boolean; success?: boolean }>>({});

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    try {
      setIsLoading(true);
      // TODO: 实现获取n8n实例列表的API调用
      // const response = await fetch('/api/n8n/instances');
      // const data = await response.json();
      // setInstances(data.data);
    } catch (error) {
      console.error('获取n8n实例列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInstance = () => {
    setEditingInstance(null);
    setIsModalOpen(true);
  };

  const handleEditInstance = (instance: N8nInstance) => {
    setEditingInstance(instance);
    setIsModalOpen(true);
  };

  const handleDeleteInstance = async (id: number) => {
    if (window.confirm('确定要删除这个n8n实例吗？')) {
      try {
        // await fetch(`/api/n8n/instances/${id}`, { method: 'DELETE' });
        fetchInstances();
      } catch (error) {
        console.error('删除实例失败:', error);
      }
    }
  };

  const handleTestConnection = async (id: number) => {
    try {
      setTestResults(prev => ({ ...prev, [id]: { loading: true } }));
      // const response = await fetch(`/api/n8n/instances/${id}/test`, { method: 'POST' });
      // const data = await response.json();
      // setTestResults(prev => ({ ...prev, [id]: { loading: false, success: data.data.success } }));
    } catch (error) {
      console.error('测试连接失败:', error);
      setTestResults(prev => ({ ...prev, [id]: { loading: false, success: false } }));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInstance(null);
  };

  const handleSaveInstance = async () => {
    fetchInstances();
    handleCloseModal();
  };

  return (
    <div className="n8n-page">
      <header className="page-header">
        <h1>n8n接口管理</h1>
        <button className="btn btn-primary" onClick={handleAddInstance}>
          添加实例
        </button>
      </header>

      {isLoading ? (
        <div className="loading">加载中...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>实例名称</th>
              <th>URL</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {instances.map((instance) => (
              <tr key={instance.id}>
                <td>#{instance.id}</td>
                <td>{instance.name}</td>
                <td>{instance.url}</td>
                <td>
                  <span className={`status ${instance.enabled ? 'status-active' : 'status-inactive'}`}>
                    {instance.enabled ? '启用' : '禁用'}
                  </span>
                </td>
                <td>{new Date(instance.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleEditInstance(instance)}
                    >
                      编辑
                    </button>
                    <button 
                      className="btn btn-info"
                      onClick={() => handleTestConnection(instance.id)}
                      disabled={testResults[instance.id]?.loading}
                    >
                      {testResults[instance.id]?.loading ? '测试中...' : '测试连接'}
                    </button>
                    {testResults[instance.id]?.success !== undefined && (
                      <span className={testResults[instance.id]?.success ? 'text-success' : 'text-error'}>
                        {testResults[instance.id]?.success ? '成功' : '失败'}
                      </span>
                    )}
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeleteInstance(instance.id)}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <N8nInstanceModal 
          instance={editingInstance}
          onClose={handleCloseModal}
          onSave={handleSaveInstance}
        />
      )}
    </div>
  );
}

function N8nInstanceModal({ instance, onClose, onSave }: { 
  instance: N8nInstance | null; 
  onClose: () => void; 
  onSave: () => void; 
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (instance) {
      setName(instance.name);
      setUrl(instance.url);
      setApiKey('');
      setEnabled(instance.enabled);
    } else {
      setName('');
      setUrl('');
      setApiKey('');
      setEnabled(true);
    }
  }, [instance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const instanceData = {
        name,
        url,
        apiKey,
        enabled,
      };

      if (instance) {
        // 更新实例
        // await fetch(`/api/n8n/instances/${instance.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(instanceData),
        // });
      } else {
        // 创建新实例
        // await fetch('/api/n8n/instances', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(instanceData),
        // });
      }

      onSave();
    } catch (err) {
      setError('保存实例失败');
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{instance ? '编辑实例' : '添加实例'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">实例名称</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="url">URL</label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={instance ? "留空表示不修改" : ""}
              {...(!instance && { required: true })}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="enabled">
              <input
                id="enabled"
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              启用实例
            </label>
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