import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthForm } from './components/AuthForm';
import { StatsCards } from './components/StatsCards';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { taskApi } from './api/client';
import { AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';

export default function App() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, highPriority: 0 });
  const [tasksLoading, setTasksLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Global Notification / Error Toast
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 5000);
  };

  // Fetch Stats from backend
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await taskApi.getStats();
      if (res.data) setStats(res.data);
    } catch (err) {
      console.warn('Failed to load stats:', err.message);
    }
  }, [isAuthenticated]);

  // Fetch Tasks from backend
  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    setTasksLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterPriority !== 'all') params.priority = filterPriority;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await taskApi.getTasks(params);
      setTasks(res.data?.tasks || []);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setTasksLoading(false);
    }
  }, [isAuthenticated, filterStatus, filterPriority, searchQuery]);

  // Sync on auth or filter change
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchStats();
    }
  }, [isAuthenticated, fetchTasks, fetchStats]);

  // 1. Optimistic Task Creation
  const handleAddTask = async (newTaskData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      id: tempId,
      ...newTaskData,
      is_completed: false,
      created_at: new Date().toISOString(),
      isOptimistic: true
    };

    // Optimistically update UI immediately
    setTasks((prev) => [optimisticTask, ...prev]);
    setStats((prev) => ({
      ...prev,
      total: prev.total + 1,
      pending: prev.pending + 1,
      highPriority: newTaskData.priority === 'high' ? prev.highPriority + 1 : prev.highPriority
    }));

    setIsCreating(true);
    try {
      const res = await taskApi.createTask(newTaskData);
      const serverTask = res.data.task;

      // Replace temporary optimistic item with the server's persisted item
      setTasks((prev) => prev.map((t) => (t.id === tempId ? serverTask : t)));
      fetchStats();
    } catch (err) {
      // Rollback on failure
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      fetchStats();
      showNotification(`Failed to create task: ${err.message}`, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // 2. Optimistic Status Toggle
  const handleToggleStatus = async (taskId, nextStatus) => {
    const previousTasks = [...tasks];
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    // Optimistic local state update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_completed: nextStatus } : t))
    );

    // Optimistic stats update
    setStats((prev) => ({
      ...prev,
      completed: nextStatus ? prev.completed + 1 : Math.max(0, prev.completed - 1),
      pending: nextStatus ? Math.max(0, prev.pending - 1) : prev.pending + 1
    }));

    try {
      await taskApi.updateTask(taskId, { is_completed: nextStatus });
      fetchStats();
    } catch (err) {
      // Revert to original state on failure
      setTasks(previousTasks);
      fetchStats();
      showNotification(`Failed to update task: ${err.message}`, 'error');
    }
  };

  // 3. Optimistic Task Deletion
  const handleDeleteTask = async (taskId) => {
    const previousTasks = [...tasks];
    const taskToDelete = tasks.find((t) => t.id === taskId);
    if (!taskToDelete) return;

    // Optimistic removal from UI
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setStats((prev) => ({
      ...prev,
      total: Math.max(0, prev.total - 1),
      completed: taskToDelete.is_completed ? Math.max(0, prev.completed - 1) : prev.completed,
      pending: !taskToDelete.is_completed ? Math.max(0, prev.pending - 1) : prev.pending
    }));

    try {
      await taskApi.deleteTask(taskId);
      fetchStats();
    } catch (err) {
      // Revert on failure
      setTasks(previousTasks);
      fetchStats();
      showNotification(`Failed to delete task: ${err.message}`, 'error');
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />

      {notification && (
        <div className={`alert-banner ${notification.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {!isAuthenticated ? (
        <AuthForm />
      ) : (
        <main>
          <StatsCards stats={stats} />
          <TaskForm onAddTask={handleAddTask} isCreating={isCreating} />
          <TaskList
            tasks={tasks}
            isLoading={tasksLoading}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onToggleStatus={handleToggleStatus}
            onDeleteTask={handleDeleteTask}
          />
        </main>
      )}
    </div>
  );
}
