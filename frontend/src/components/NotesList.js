import React, { useState } from 'react';
import './NotesList.css';

const NotesList = ({ notes, onEdit, onDelete, loading }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      setDeletingId(id);
      await onDelete(id);
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="notes-loading">
        <div className="loading-spinner"></div>
        <p>Loading notes...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="notes-empty">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No notes yet</h3>
          <p>Create your first note to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-list">
      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note.id} className="note-card">
            <div className="note-header">
              <h3 className="note-title">{note.title}</h3>
              <div className="note-actions">
                <button
                  onClick={() => onEdit(note)}
                  className="note-action-btn edit-btn"
                  title="Edit note"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="note-action-btn delete-btn"
                  disabled={deletingId === note.id}
                  title="Delete note"
                >
                  {deletingId === note.id ? '⏳' : '🗑️'}
                </button>
              </div>
            </div>

            <div className="note-content">
              {truncateContent(note.content)}
            </div>

            <div className="note-footer">
              <div className="note-meta">
                <span className="note-author">By {note.created_by}</span>
                <span className="note-date">
                  {note.updated_at !== note.created_at ? 'Updated' : 'Created'} {formatDate(note.updated_at || note.created_at)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;
