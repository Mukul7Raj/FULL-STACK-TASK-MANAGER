import React from 'react';
import { CheckCircle2, Clock, Flame, ListTodo } from 'lucide-react';

export const StatsCards = ({ stats }) => {
  const { total = 0, completed = 0, pending = 0, highPriority = 0 } = stats || {};

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="stats-grid" aria-label="Task Statistics">
      <div className="glass-card stat-card">
        <div>
          <div className="stat-label">Total Tasks</div>
          <div className="stat-number">{total}</div>
        </div>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
          <ListTodo size={22} />
        </div>
      </div>

      <div className="glass-card stat-card">
        <div>
          <div className="stat-label">Completed</div>
          <div className="stat-number" style={{ color: '#10b981' }}>{completed}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{completionRate}% rate</span>
        </div>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
          <CheckCircle2 size={22} />
        </div>
      </div>

      <div className="glass-card stat-card">
        <div>
          <div className="stat-label">In Progress</div>
          <div className="stat-number" style={{ color: '#f59e0b' }}>{pending}</div>
        </div>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
          <Clock size={22} />
        </div>
      </div>

      <div className="glass-card stat-card">
        <div>
          <div className="stat-label">High Priority</div>
          <div className="stat-number" style={{ color: '#ef4444' }}>{highPriority}</div>
        </div>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
          <Flame size={22} />
        </div>
      </div>
    </section>
  );
};
