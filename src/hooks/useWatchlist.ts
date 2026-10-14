import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useWatchlist(itemType: string) {
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [userId, setUserId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session?.user) return;
            setUserId(session.user.id);
            supabase.from("watchlist").select("item_id").eq("user_id", session.user.id).eq("item_type", itemType)
                .then(({ data }) => {
                    if (data) setSavedIds(new Set(data.map(d => d.item_id)));
                });
        });
    }, [itemType]);

    const toggle = useCallback(async (itemId: string, itemName: string, itemMeta?: any) => {
        if (!userId) {
            toast({ title: "Sign in required", description: "Please sign in to use your watchlist.", variant: "destructive" });
            return;
        }
        if (savedIds.has(itemId)) {
            // Remove
            await supabase.from("watchlist").delete().eq("user_id", userId).eq("item_id", itemId).eq("item_type", itemType);
            setSavedIds(prev => { const s = new Set(prev); s.delete(itemId); return s; });
            toast({ title: "Removed from watchlist" });
        } else {
            // Add
            await supabase.from("watchlist").upsert({
                user_id: userId, item_id: itemId, item_type: itemType, item_name: itemName, item_meta: itemMeta ?? {},
            }, { onConflict: "user_id,item_id,item_type" });
            setSavedIds(prev => new Set([...prev, itemId]));
            toast({ title: "❤️ Added to watchlist!", description: `${itemName} saved to your dashboard.` });
        }
    }, [userId, savedIds, itemType, toast]);

    return { savedIds, toggle };
}
