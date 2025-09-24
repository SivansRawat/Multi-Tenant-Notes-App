import React, { useState, useEffect } from 'react';
import './NoteForm.css';

const NoteForm = ({ note, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || ''
      });
    }
  }, [note]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(formData);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to save note';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="note-form-overlay" onClick={handleOverlayClick}>
      <div className="note-form-modal">
        <div className="note-form-header">
          <h2>{isEditing ? 'Edit Note' : 'Create New Note'}</h2>
          <button 
            className="close-button"
            onClick={onCancel}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="note-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter note title"
              required
              disabled={loading}
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your note content here..."
              required
              disabled={loading}
              rows={10}
            />
            <div className="content-info">
              {formData.content.length} characters
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Note' : 'Create Note')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;
