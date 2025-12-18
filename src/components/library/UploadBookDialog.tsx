
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
import { Upload, BookOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function UploadBookDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
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
                <Button variant="emerald" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Book
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload a Book</DialogTitle>
                    <DialogDescription>
                        Share your trading knowledge with the community. Supported formats: PDF, EPUB.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Book Title</Label>
                        <Input id="title" name="title" placeholder="e.g. Trading in the Zone" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="author">Author</Label>
                        <Input id="author" name="author" placeholder="e.g. Mark Douglas" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" name="category" placeholder="e.g. Psychology" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Brief summary of the book..." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="file">Book File</Label>
                        <div className="border-2 border-dashed border-input hover:border-emerald-500/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-secondary/50 relative">
                            <BookOpen className="w-8 h-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">{file ? file.name : "Click to select file"}</p>
                            <p className="text-xs text-muted-foreground">PDF or EPUB up to 10MB</p>
                            <Input
                                id="file"
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept=".pdf,.epub"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600">
                            {loading ? "Uploading..." : "Upload Book"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
