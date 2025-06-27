import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div >
      <Card >
        <CardContent >
          <div >
            <AlertCircle  />
            <h1 >404 Page Not Found</h1>
          </div>

          <p >
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
