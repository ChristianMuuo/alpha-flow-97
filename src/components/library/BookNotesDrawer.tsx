import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, StickyNote, BookMarked } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookNote {
    id: string;
    note_text: string;
    page_number: number | null;
    highlight_color: string;
    created_at: string;
}

interface BookNotesDrawerProps {
    bookId: string | undefined;
    bookTitle: string | undefined;
    currentPage?: number;
}

export default function BookNotesDrawer({ bookId, bookTitle, currentPage }: BookNotesDrawerProps) {
    const [notes, setNotes] = useState<BookNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const { toast } = useToast();

    const COLORS = [
        { id: 'yellow', bg: 'bg-yellow-400/20', border: 'border-yellow-400/40', dot: 'bg-yellow-400' },
        { id: 'emerald', bg: 'bg-emerald-400/20', border: 'border-emerald-400/40', dot: 'bg-emerald-400' },
        { id: 'blue', bg: 'bg-blue-400/20', border: 'border-blue-400/40', dot: 'bg-blue-400' },
        { id: 'pink', bg: 'bg-pink-400/20', border: 'border-pink-400/40', dot: 'bg-pink-400' },
    ];
    const [selectedColor, setSelectedColor] = useState('yellow');

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user || !bookId) return;
            setUserId(session.user.id);

            const { data } = await supabase
                .from('book_notes')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('book_id', bookId)
                .order('created_at', { ascending: false });

            if (data) setNotes(data as BookNote[]);
        };
        init();
    }, [bookId]);

    const addNote = async () => {
        if (!newNote.trim() || !userId || !bookId) return;
        setSaving(true);

        const { data, error } = await supabase.from('book_notes').insert({
            user_id: userId,
            book_id: bookId,
            note_text: newNote.trim(),
            page_number: currentPage ?? null,
            highlight_color: selectedColor,
        }).select().single();

        if (!error && data) {
            setNotes(prev => [data as BookNote, ...prev]);
            setNewNote('');
            toast({ title: '📝 Note saved!', duration: 1500 });
        }
        setSaving(false);
    };

    const deleteNote = async (noteId: string) => {
        await supabase.from('book_notes').delete().eq('id', noteId);
        setNotes(prev => prev.filter(n => n.id !== noteId));
        toast({ title: 'Note deleted', duration: 1500 });
    };

    const colorFor = (colorId: string) =>
        COLORS.find(c => c.id === colorId) ?? COLORS[0];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#2a2a2a] shrink-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-0.5">
                    <BookMarked className="w-4 h-4 text-emerald-400" />
                    Book Notes
                </div>
                {bookTitle && (
                    <p className="text-[10px] text-gray-500 truncate">{bookTitle}</p>
                )}
            </div>

            {/* Note Input */}
            <div className="px-4 py-3 border-b border-[#2a2a2a] shrink-0 space-y-2">
                <textarea
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Write a note or highlight..."
                    rows={3}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 resize-none focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <div className="flex items-center justify-between">
                    {/* Color Selector */}
                    <div className="flex items-center gap-1.5">
                        {COLORS.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedColor(c.id)}
                                className={`w-4 h-4 rounded-full ${c.dot} transition-transform ${selectedColor === c.id ? 'scale-125 ring-2 ring-white/30' : 'opacity-60'}`}
                            />
                        ))}
                    </div>
                    <Button
                        size="sm"
                        disabled={!newNote.trim() || saving}
                        onClick={addNote}
                        className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold gap-1 h-7 text-xs px-3"
                    >
                        <Plus className="w-3 h-3" />
                        {saving ? 'Saving...' : 'Add Note'}
                    </Button>
                </div>
            </div>

            {/* Notes List */}
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                    {notes.length === 0 ? (
                        <div className="text-center py-12 text-gray-600">
                            <StickyNote className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p className="text-xs">No notes yet.</p>
                            <p className="text-xs">Add your first note above!</p>
                        </div>
                    ) : (
                        notes.map(note => {
                            const c = colorFor(note.highlight_color);
                            return (
                                <div
                                    key={note.id}
                                    className={`group relative rounded-lg border p-3 ${c.bg} ${c.border}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${c.dot}`} />
                                        <p className="text-xs text-gray-200 leading-relaxed flex-1">{note.note_text}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] text-gray-600">
                                            {note.page_number ? `Page ${note.page_number} · ` : ''}
                                            {new Date(note.created_at).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() => deleteNote(note.id)}
                                            className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all p-0.5 rounded"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            {notes.length > 0 && (
                <div className="px-4 py-2 border-t border-[#2a2a2a] shrink-0">
                    <p className="text-[10px] text-gray-600 text-center">{notes.length} note{notes.length !== 1 ? 's' : ''} for this book</p>
                </div>
            )}
        </div>
    );
}
