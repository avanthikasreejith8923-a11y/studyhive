import React, { useState, useEffect } from 'react';
import { sessionsAPI, tasksAPI } from '../../services/api';
import { CheckSquare, Square, Trash2, Plus, ListTodo, CheckCircle2 } from 'lucide-react';

export const TaskList = ({ sessionId, onTasksChange }) => {
  const [tasks, setTasks] = useState([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  // Fetch tasks when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      setTasks([]);
      return;
    }

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const data = await sessionsAPI.getTasks(sessionId);
        setTasks(data.tasks || []);
        if (onTasksChange) onTasksChange(data.tasks || []);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [sessionId]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newText.trim() || !sessionId || adding) return;

    setAdding(true);
    setError('');
    try {
      const data = await sessionsAPI.createTask(sessionId, newText.trim());
      const updated = [...tasks, data.task];
      setTasks(updated);
      setNewText('');
      if (onTasksChange) onTasksChange(updated);
    } catch (err) {
      setError(err.message || 'Failed to add task.');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleDone = async (task) => {
    const updatedStatus = !task.done;
    // Optimistic UI update
    const nextTasks = tasks.map((t) =>
      t._id === task._id ? { ...t, done: updatedStatus } : t
    );
    setTasks(nextTasks);
    if (onTasksChange) onTasksChange(nextTasks);

    try {
      await tasksAPI.update(task._id, { done: updatedStatus });
    } catch (err) {
      console.error('Failed to update task done state:', err);
      // Revert on error
      setTasks(tasks);
      if (onTasksChange) onTasksChange(tasks);
    }
  };

  const handleDeleteTask = async (taskId) => {
    // Optimistic UI update
    const nextTasks = tasks.filter((t) => t._id !== taskId);
    setTasks(nextTasks);
    if (onTasksChange) onTasksChange(nextTasks);

    try {
      await tasksAPI.delete(taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
      // Revert on error
      setTasks(tasks);
      if (onTasksChange) onTasksChange(tasks);
    }
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.done).length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="pixel-panel bg-cream-100 p-4 shadow-pixel">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b-2 border-pixel-border pb-2">
        <div className="flex items-center gap-1.5 font-pixel text-xs text-oak-900">
          <ListTodo size={15} className="text-honey-700" />
          <span>SESSION GOALS</span>
        </div>
        <div className="font-sans text-xs font-semibold text-oak-700 bg-honey-200 border border-pixel-border px-2 py-0.5 shadow-pixel-sm">
          {completedTasks}/{totalTasks} done ({progressPercent}%)
        </div>
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="mb-3">
          <div className="w-full h-2 bg-cream-300 border border-pixel-border">
            <div
              className="h-full bg-honey-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="flex gap-2 mb-3.5">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a task to complete (e.g. Solve 5 problems)..."
          className="flex-1 pixel-input text-sm font-sans"
          maxLength={150}
          disabled={!sessionId || adding}
        />
        <button
          type="submit"
          disabled={!sessionId || !newText.trim() || adding}
          className="pixel-btn-primary px-3 text-xs flex items-center gap-1"
        >
          <Plus size={14} />
          <span>ADD</span>
        </button>
      </form>

      {error && (
        <div className="text-red-700 font-sans text-xs mb-2">
          ⚠️ {error}
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-4 font-sans text-xs text-oak-600">
            Loading session goals...
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-5 bg-cream-200/60 border-2 border-dashed border-pixel-border/30 p-3">
            <p className="font-sans text-xs text-oak-700">
              No tasks added yet for this desk session.
            </p>
            <p className="font-sans text-[11px] text-oak-500 mt-0.5">
              Add your goals above to track what you accomplish!
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className={`flex items-center justify-between p-2 border-2 transition-colors select-none ${
                task.done
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 line-through opacity-80'
                  : 'bg-white border-pixel-border text-oak-900 shadow-pixel-sm'
              }`}
            >
              {/* Checkbox and Text */}
              <div
                onClick={() => handleToggleDone(task)}
                className="flex items-center gap-2.5 flex-1 cursor-pointer"
              >
                <button
                  type="button"
                  className="text-honey-700 hover:text-honey-800 transition-colors"
                >
                  {task.done ? (
                    <CheckSquare size={17} className="text-emerald-600" />
                  ) : (
                    <Square size={17} className="text-oak-700" />
                  )}
                </button>
                <span className="font-sans text-sm font-medium break-words flex-1">
                  {task.text}
                </span>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleDeleteTask(task._id)}
                className="text-oak-400 hover:text-red-600 p-1 transition-colors"
                title="Remove task"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
