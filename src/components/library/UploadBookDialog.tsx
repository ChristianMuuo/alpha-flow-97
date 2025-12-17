
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

export function UploadBookDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate upload delay
        setTimeout(() => {
            setLoading(false);
            setOpen(false);
            toast.success("Book uploaded successfully!", {
                description: "Your book has been added to the library pending review.",
            });
        }, 1500);
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
                        <Input id="title" placeholder="e.g. Trading in the Zone" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="author">Author</Label>
                        <Input id="author" placeholder="e.g. Mark Douglas" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" placeholder="e.g. Psychology" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Brief summary of the book..." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="file">Book File</Label>
                        <div className="border-2 border-dashed border-input hover:border-emerald-500/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-secondary/50">
                            <BookOpen className="w-8 h-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Click to select file</p>
                            <p className="text-xs text-muted-foreground">PDF or EPUB up to 10MB</p>
                            <Input id="file" type="file" className="hidden" accept=".pdf,.epub" />
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
