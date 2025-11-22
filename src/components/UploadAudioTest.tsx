import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function UploadAudioTest() {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "ogg";
      const path = `voices/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("audios").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("audios").getPublicUrl(path);
      setUrl(data.publicUrl);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 p-4 border rounded-xl bg-white space-y-3">
      <div className="font-medium">Audio upload test</div>
      <input type="file" accept="audio/*" onChange={onPick} disabled={busy} />
      {url && (
        <>
          <div className="text-sm break-all">Public URL: {url}</div>
          <audio src={url} controls className="w-full" />
        </>
      )}
    </div>
  );
}