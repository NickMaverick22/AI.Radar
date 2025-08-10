import { useEffect, useRef, useState } from "react";
import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function VoiceAdvisor() {
  const { toast } = useToast();
  const conversation = useConversation({
    onMessage: (m) => setMessages((prev) => [...prev, (m as any).message ?? ""]),
    onError: (e) => toast({ title: "Voice error", description: String(e), variant: "destructive" }),
  });

  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem("eleven_api_key") || "");
  const [agentId, setAgentId] = useState<string>(() => localStorage.getItem("eleven_agent_id") || "");
  const [messages, setMessages] = useState<string[]>([]);
  const connectedRef = useRef(false);

  useEffect(() => {
    // store keys
    if (apiKey) localStorage.setItem("eleven_api_key", apiKey);
    if (agentId) localStorage.setItem("eleven_agent_id", agentId);
  }, [apiKey, agentId]);

  const connect = async () => {
    try {
      if (!agentId) {
        toast({ title: "Missing configuration", description: "Enter Agent ID" });
        return;
      }
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try private agent via signed URL
      let signedUrl: string | undefined;
      try {
        const { data, error } = await supabase.functions.invoke("xi-signed-url", {
          body: { agent_id: agentId },
        });
        if (error) throw error;
        signedUrl = (data as any)?.websocket_url || (data as any)?.ws_url || (data as any)?.signed_url || (data as any)?.url;
      } catch {
        signedUrl = undefined; // fall back to public agent
      }

      if (signedUrl) {
        await conversation.startSession({ signedUrl });
      } else {
        await conversation.startSession({ agentId });
      }
      connectedRef.current = true;
      toast({ title: "Voice connected", description: "Speak to the market analyst." });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to connect", description: "Check Agent ID and mic permissions", variant: "destructive" });
    }
  };

  const disconnect = async () => {
    try {
      await conversation.endSession();
      connectedRef.current = false;
    } catch {}
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <div className="flex-1 space-y-2">
          <label className="text-sm text-muted-foreground">ElevenLabs API Key</label>
          <Input
            type="password"
            placeholder="sk_..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm text-muted-foreground">Agent ID (public)</label>
          <Input
            placeholder="agent_..."
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={connect} disabled={conversation.status === "connected"}>Start</Button>
          <Button onClick={disconnect} variant="outline" disabled={conversation.status !== "connected"}>Stop</Button>
        </div>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        Status: <span className="font-medium text-foreground">{conversation.status}</span>{" "}
        {conversation.isSpeaking ? "• Speaking" : ""}
      </div>
      {messages.length > 0 && (
        <div className="mt-4 max-h-48 overflow-auto rounded-lg border p-3 text-sm">
          {messages.map((m, i) => (
            <p key={i} className="mb-2 last:mb-0">{m}</p>
          ))}
        </div>
      )}
    </Card>
  );
}
