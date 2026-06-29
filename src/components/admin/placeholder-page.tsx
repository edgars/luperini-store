import { Card, CardContent } from "@/components/ui/card";

export function AdminPlaceholderPage({
  description = "Esta área será implementada nas próximas etapas do MVP.",
}: {
  description?: string;
}) {
  return (
    <Card className="w-full">
      <CardContent className="py-8">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
