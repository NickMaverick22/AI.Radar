import { useEffect, useRef, useState } from "react";
import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


export default function VoiceAdvisor() {
  const { toast } = useToast();
  const VOICES = [
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
    { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte' },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' },
  ];
  const [voiceId, setVoiceId] = useState<string>(() => localStorage.getItem('eleven_voice_id') || '9BWtsMINqrJLrRacOk9x');
  const [volume, setVolume] = useState<number>(() => {
    const v = localStorage.getItem('eleven_volume');
    return v ? Number(v) : 0.9;
  });
  const [messages, setMessages] = useState<string[]>([]);
  const conversation = useConversation({
    overrides: { tts: { voiceId } },
    onMessage: (m) => setMessages((prev) => [...prev, (m as any).message ?? ""]),
    onError: (e) => toast({ title: "Voice error", description: String(e), variant: "destructive" }),
  });

  
  const [agentId, setAgentId] = useState<string>(() => localStorage.getItem("eleven_agent_id") || "");
  const [messages, setMessages] = useState<string[]>([]);
  const connectedRef = useRef(false);

  useEffect(() => {
    // store agent id only
    if (agentId) localStorage.setItem("eleven_agent_id", agentId);
  }, [agentId]);

  const connect = async () => {
    try {
      if (!agentId) {
        toast({ title: "Missing configuration", description: "Enter Agent ID" });
        return;
      }
      await navigator.mediaDevices.getUserMedia({ audio: true });

      await conversation.startSession({ agentId });
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
