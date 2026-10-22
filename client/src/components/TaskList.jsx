import React from 'react';
import { TaskItem } from './TaskItem';
import { Search, Inbox, Loader2 } from 'lucide-react';

export const TaskList = ({
  tasks,
  isLoading,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  searchQuery,
  setSearchQuery,
  onToggleStatus,
  onDeleteTask
}) => {
  return (
    <section aria-label="Task Management View">
      {/* Filtering Toolbar */}
      <div className="tasks-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className="filter-pills">
            <button
              type="button"
              className={`filter-pill ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-pill ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              In Progress
            </button>
            <button
              type="button"
              className={`filter-pill ${filterStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </button>
          </div>

          <select
            className="form-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task List Rendering with Loading & Empty States */}
      {isLoading ? (
        <div className="empty-state">
          <Loader2 size={32} className="spin" style={{ color: 'var(--accent-primary)' }} />
          <span>Loading tasks from PostgreSQL...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card empty-state">
          <Inbox size={42} style={{ color: 'var(--text-muted)' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No tasks found</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {searchQuery
                ? 'No tasks match your current search query or filter.'
                : 'Create your first task above to start tracking progress.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}
    </section>
  );
};
