import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const defaultWeights = {
  performance: 25,
  adoption: 20,
  satisfaction: 20,
  velocity: 20,
  docs: 10,
  value: 5,
};

type Weights = typeof defaultWeights;

export default function Admin() {
  const { toast } = useToast();
  const [weights, setWeights] = useState<Weights>(() => {
    const saved = localStorage.getItem("amr_weights");
    return saved ? JSON.parse(saved) : defaultWeights;
  });

  useEffect(() => {
    localStorage.setItem("amr_weights", JSON.stringify(weights));
  }, [weights]);

  const onSave = () => {
    toast({ title: "Weights saved", description: "Local preview updated" });
  };

  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>Admin Weights Editor | AI Market Radar</title>
        <meta name="description" content="Tune category weights and preview effects locally." />
        <link rel="canonical" href={window.location.origin + "/admin"} />
      </Helmet>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Admin: Weights</h1>
        <p className="text-muted-foreground">Adjust weights for ranking signals. This demo stores changes locally.</p>
      </header>

      <Card className="p-4 max-w-xl">
        <div className="grid grid-cols-5 gap-3 items-center mb-3">
          <label className="col-span-3 text-sm">Performance/Capability</label>
          <Input type="range" min={0} max={100} value={weights.performance}
            onChange={(e) => setWeights({ ...weights, performance: Number(e.target.value) })} className="col-span-2" />
        </div>
        <div className="grid grid-cols-5 gap-3 items-center mb-3">
          <label className="col-span-3 text-sm">Adoption/Traction</label>
          <Input type="range" min={0} max={100} value={weights.adoption}
            onChange={(e) => setWeights({ ...weights, adoption: Number(e.target.value) })} className="col-span-2" />
        </div>
        <div className="grid grid-cols-5 gap-3 items-center mb-3">
          <label className="col-span-3 text-sm">User Satisfaction</label>
          <Input type="range" min={0} max={100} value={weights.satisfaction}
            onChange={(e) => setWeights({ ...weights, satisfaction: Number(e.target.value) })} className="col-span-2" />
        </div>
        <div className="grid grid-cols-5 gap-3 items-center mb-3">
          <label className="col-span-3 text-sm">Innovation Velocity</label>
          <Input type="range" min={0} max={100} value={weights.velocity}
            onChange={(e) => setWeights({ ...weights, velocity: Number(e.target.value) })} className="col-span-2" />
        </div>
        <div className="grid grid-cols-5 gap-3 items-center mb-3">
          <label className="col-span-3 text-sm">Docs/Support</label>
          <Input type="range" min={0} max={100} value={weights.docs}
            onChange={(e) => setWeights({ ...weights, docs: Number(e.target.value) })} className="col-span-2" />
        </div>
        <div className="grid grid-cols-5 gap-3 items-center mb-4">
          <label className="col-span-3 text-sm">Price/Value</label>
          <Input type="range" min={0} max={100} value={weights.value}
            onChange={(e) => setWeights({ ...weights, value: Number(e.target.value) })} className="col-span-2" />
        </div>
        <Button onClick={onSave}>Save</Button>
      </Card>
    </div>
  );
}
