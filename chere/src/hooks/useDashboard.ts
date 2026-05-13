"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Creation, OccasionReminder } from "@/lib/supabase/types";

export function useCreations() {
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchCreations() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("DASHBOARD: auth.getUser failed:", authError);
        setLoading(false);
        return;
      }
      if (!user) {
        console.warn("DASHBOARD: no authenticated user — skipping fetch");
        setLoading(false);
        return;
      }
      console.log("DASHBOARD: fetching creations for user:", user.id);
      const { data: rows, error } = await supabase
        .from("creations")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("DASHBOARD: creations query failed:", error);
      } else {
        console.log("DASHBOARD: fetched", rows?.length ?? 0, "creations");
      }
      setCreations((rows as Creation[]) ?? []);
      setLoading(false);
    }

    fetchCreations();

    // Re-fetch when auth state changes (e.g. session resolves after mount)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCreations();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { creations, loading };
}

export function useOccasions() {
  const [occasions, setOccasions] = useState<OccasionReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setLoading(false); return; }
      supabase
        .from("occasion_reminders")
        .select("*")
        .eq("profile_id", data.user.id)
        .order("occasion_date", { ascending: true })
        .then(({ data: rows }) => {
          setOccasions((rows as OccasionReminder[]) ?? []);
          setLoading(false);
        });
    });
  }, []);

  async function addOccasion(fields: {
    recipient_name: string;
    occasion_type: string;
    occasion_date: string;
    remind_days_before?: number;
  }): Promise<OccasionReminder | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("occasion_reminders")
      .insert({
        profile_id: user.id,
        recipient_name: fields.recipient_name,
        occasion_type: fields.occasion_type,
        occasion_date: fields.occasion_date,
        remind_days_before: fields.remind_days_before ?? 7,
      })
      .select()
      .single();
    if (error || !data) return null;
    const newOccasion = data as OccasionReminder;
    setOccasions((prev) =>
      [...prev, newOccasion].sort(
        (a, b) => new Date(a.occasion_date).getTime() - new Date(b.occasion_date).getTime()
      )
    );
    return newOccasion;
  }

  async function removeOccasion(id: string) {
    const supabase = createClient();
    await supabase.from("occasion_reminders").delete().eq("id", id);
    setOccasions((prev) => prev.filter((o) => o.id !== id));
  }

  return { occasions, loading, addOccasion, removeOccasion };
}
