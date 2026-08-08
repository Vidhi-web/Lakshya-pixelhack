'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StickyNote, Plus, Search, Tag, X, Star, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import RichTextEditor from '@/components/editor/RichTextEditor';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      
      const data = await response.json();
      setNotes(data.notes || []);
      setFilteredNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Filter notes based on search and tag
  useEffect(() => {
    let filtered = notes;

    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }

    setFilteredNotes(filtered);
  }, [notes, searchQuery, selectedTag]);

  const getAllTags = () => {
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setTitle('');
    setContent('{"type":"doc","content":[{"type":"paragraph"}]}');
    setTags([]);
    setIsFavorite(false);
    setShowEditor(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || '{"type":"doc","content":[{"type":"paragraph"}]}');
    setTags(note.tags || []);
    setIsFavorite(note.is_favorite);
    setShowEditor(true);
  };

  const handleSaveNote = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);

    try {
      if (editingNote) {
        // Update existing note
        const response = await fetch(`/api/notes/${editingNote.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            tags,
            is_favorite: isFavorite,
          }),
        });

        if (!response.ok) throw new Error('Failed to update note');
        toast.success('Note updated successfully!');
      } else {
        // Create new note
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            content_type: 'json',
            tags,
            is_favorite: isFavorite,
          }),
        });

        if (!response.ok) throw new Error('Failed to create note');
        toast.success('Note created successfully!');
      }

      await fetchNotes();
      setShowEditor(false);
      handleCreateNote(); // Reset form
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete note');

      toast.success('Note deleted successfully!');
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const toggleFavorite = async (note: Note) => {
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_favorite: !note.is_favorite,
        }),
      });

      if (!response.ok) throw new Error('Failed to update favorite');

      toast.success(note.is_favorite ? 'Removed from favorites' : 'Added to favorites');
      await fetchNotes();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getPreviewText = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      let text = '';
      const extractText = (node: any) => {
        if (node.text) {
          text += node.text + ' ';
        }
        if (node.content) {
          node.content.forEach(extractText);
        }
      };
      extractText(parsed);
      return text.trim().substring(0, 150) + (text.length > 150 ? '...' : '');
    } catch {
      return content.substring(0, 150) + (content.length > 150 ? '...' : '');
    }
  };

  if (showEditor) {
    return (
      <div className="min-h-screen p-4 md:p-8 transition-colors" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
        <Toaster position="top-right" />
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowEditor(false)}
              className="mb-4"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Notes
            </Button>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>
              {editingNote ? 'Edit Note' : 'Create Note'}
            </h1>
          </div>

          <Card className="shadow-2xl border rounded-2xl" style={{ background: 'var(--theme-background-alt)', borderColor: 'var(--theme-border)' }}>
            <CardContent className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title"
                  className="text-lg font-semibold rounded-xl"
                  style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>Content</label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your note..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag..."
                    className="rounded-xl"
                    style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                  />
                  <Button type="button" onClick={addTag} variant="outline" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-sm flex items-center gap-2" style={{ background: 'var(--theme-accent)', color: '#fff' }}>
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:opacity-70">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Favorite */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="favorite"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="favorite" className="text-sm font-medium cursor-pointer" style={{ color: 'var(--theme-text-primary)' }}>
                  Mark as favorite
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveNote}
                  disabled={loading}
                  className="flex-1 text-white font-bold rounded-xl"
                  style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
                >
                  {loading ? 'Saving...' : editingNote ? 'Update Note' : 'Create Note'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditor(false)}
                  disabled={loading}
                  className="rounded-xl"
                  style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-colors" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
              Notes
            </h1>
            <p className="opacity-70" style={{ color: 'var(--theme-text-primary)' }}>Capture your thoughts and ideas</p>
          </div>
          <Button
            onClick={handleCreateNote}
            className="text-white font-bold rounded-xl"
            style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="md:col-span-2 shadow-lg border rounded-2xl" style={{ background: 'var(--theme-background-alt)', borderColor: 'var(--theme-border)' }}>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" style={{ color: 'var(--theme-text-primary)' }} />
                <Input
                  placeholder="Search notes by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                  style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border rounded-2xl" style={{ background: 'var(--theme-background-alt)', borderColor: 'var(--theme-border)' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                <select
                  value={selectedTag || ''}
                  onChange={(e) => setSelectedTag(e.target.value || null)}
                  className="flex-1 px-3 py-2 border rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                >
                  <option value="">All Tags</option>
                  {getAllTags().map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border rounded-2xl" style={{ background: 'var(--theme-background-alt)', borderColor: 'var(--theme-border)' }}>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--theme-accent)' }}>{notes.length}</div>
              <div className="text-sm opacity-70" style={{ color: 'var(--theme-text-primary)' }}>Total Notes</div>
            </CardContent>
          </Card>
          <Card className="border rounded-2xl" style={{ background: 'var(--theme-background-alt)', borderColor: 'var(--theme-border)' }}>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--theme-accent)' }}>
                {notes.filter(n => n.is_favorite).length}
              </div>
              <div className="text-sm opacity-70" style={{ color: 'var(--theme-text-primary)' }}>Favorites</div>
            </CardContent>
          </Card>
          <Card className="border rounded-2xl" style={{ background: 'var(--theme-background-alt)', borderColor: 'var(--theme-border)' }}>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--theme-accent)' }}>{getAllTags().length}</div>
              <div className="text-sm opacity-70" style={{ color: 'var(--theme-text-primary)' }}>Tags</div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <Card className="shadow-lg border rounded-2xl" style={{ background: 'var(--theme-background-alt)', borderColor: 'var(--theme-border)' }}>
            <CardContent className="p-12 text-center">
              <StickyNote className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: 'var(--theme-text-primary)' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>No notes found</h3>
              <p className="opacity-60 mb-4" style={{ color: 'var(--theme-text-primary)' }}>
                {searchQuery || selectedTag ? 'Try adjusting your filters' : 'Create your first note to get started'}
              </p>
              <Button 
                onClick={handleCreateNote} 
                className="text-white font-bold rounded-xl"
                style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <Card
                key={note.id}
                className="shadow-lg border rounded-2xl hover:shadow-2xl transition-all hover:scale-[1.02] cursor-pointer group"
                style={{ background: 'var(--theme-background-alt)', borderColor: 'var(--theme-border)' }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold flex-1 transition" style={{ color: 'var(--theme-text-primary)' }}>
                      {note.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(note);
                      }}
                      className="ml-2"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          note.is_favorite
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'opacity-40 hover:text-yellow-500'
                        }`}
                        style={{ color: note.is_favorite ? undefined : 'var(--theme-text-primary)' }}
                      />
                    </button>
                  </div>

                  <p className="mb-4 line-clamp-3 text-sm opacity-70" style={{ color: 'var(--theme-text-primary)' }}>
                    {getPreviewText(note.content)}
                  </p>

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {note.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full flex items-center gap-1 font-semibold"
                          style={{ background: 'var(--theme-accent)', color: '#fff' }}
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: 'var(--theme-surface)', color: 'var(--theme-text-primary)' }}>
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
                    <span className="text-xs opacity-60" style={{ color: 'var(--theme-text-primary)' }}>
                      {new Date(note.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditNote(note);
                        }}
                        style={{ color: 'var(--theme-text-primary)' }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
