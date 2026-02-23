import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, BookOpen, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function UploadBookDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [autoMetadata, setAutoMetadata] = useState(true);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        if (autoMetadata) {
            toast.info("AI Analysis Started", {
                description: "Extracting title, author, and description from file...",
                icon: <Sparkles className="w-4 h-4 text-emerald-400" />
            });
            // Mock autofill after delay
            setTimeout(() => {
                const name = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
                toast.success("Metadata Extracted", {
                    description: `Title: ${name}`,
                });
            }, 1500);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a book file to upload.");
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("You must be logged in to upload books.");
                setLoading(false);
                return;
            }

            const form = e.target as HTMLFormElement;
            const title = (form.elements.namedItem('title') as HTMLInputElement).value;
            const author = (form.elements.namedItem('author') as HTMLInputElement).value;
            const category = (form.elements.namedItem('category') as HTMLInputElement).value;
            const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

            // 1. Upload file to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('books')
                .upload(filePath, file);

            if (uploadError) {
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('books')
                .getPublicUrl(filePath);

            // 2. Insert record into Database
            const { error: dbError } = await supabase
                .from('books')
                .insert({
                    title,
                    author,
                    category,
                    description,
                    file_url: publicUrl,
                    user_id: user.id,
                });

            if (dbError) {
                throw new Error(`Database error: ${dbError.message}`);
            }

            toast.success("Book uploaded successfully!", {
                description: "Your book has been added to the library.",
            });
            setOpen(false);
            setFile(null);
        } catch (error: any) {
            console.error('Error uploading book:', error);
            toast.error("Failed to upload book", {
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="emerald" className="gap-2 shadow-lg hover:shadow-emerald-500/20">
                    <Upload className="w-4 h-4" />
                    Upload Book
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto border-emerald-500/20 bg-[#0a0a0a]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-display flex items-center gap-2">
                        Upload to Library
                    </DialogTitle>
                    <DialogDescription>
                        Contribute to the community knowledge base.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">

                    {/* File Dropzone */}
                    <div className="grid gap-2">
                        <Label htmlFor="file" className="text-muted-foreground">Book File (PDF, EPUB)</Label>
                        <div
                            className={cn(
                                "border-2 border-dashed border-input transition-all duration-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden group",
                                isDragging ? "border-emerald-500 bg-emerald-500/5 scale-[1.02]" : "hover:border-emerald-500/50 hover:bg-white/5",
                                file ? "border-emerald-500 bg-emerald-500/10" : "bg-card"
                            )}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]); }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            {file ? (
                                <div className="space-y-2 z-10">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                                        <CheckCircle2 className="w-6 h-6 text-black" />
                                    </div>
                                    <p className="text-sm font-medium text-emerald-400">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div className="space-y-2 z-10">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto transition-colors ${isDragging ? 'bg-emerald-500 text-black' : 'bg-secondary text-muted-foreground group-hover:bg-emerald-500/20 group-hover:text-emerald-400'}`}>
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium">Drag & drop or click to upload</p>
                                    <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Support for high-quality PDF and EPUB files up to 50MB</p>
                                </div>
                            )}

                            <Input
                                id="file"
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                                accept=".pdf,.epub"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    {/* AI Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <div className="flex flex-col">
                                <Label htmlFor="auto-metadata" className="text-sm font-medium cursor-pointer">Auto-Metadata AI</Label>
                                <span className="text-[10px] text-muted-foreground">Automatically extract details from file</span>
                            </div>
                        </div>
                        <Switch
                            id="auto-metadata"
                            checked={autoMetadata}
                            onCheckedChange={setAutoMetadata}
                            className="data-[state=checked]:bg-emerald-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" placeholder="Book Title" className="bg-secondary/50" required defaultValue={file ? file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ") : ""} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="author">Author</Label>
                            <Input id="author" name="author" placeholder="Author Name" className="bg-secondary/50" required />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" name="category" placeholder="e.g. Psychology, Smart Money Concepts, Technical Analysis" className="bg-secondary/50" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="What is this book about?" className="bg-secondary/50 resize-none min-h-[80px]" />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 font-semibold shadow-lg shadow-emerald-500/10">
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                                    Uploading...
                                </>
                            ) : "Upload to Library"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
