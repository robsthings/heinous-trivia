import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div >
      <div >
        
        {/* Header with back button */}
        <div  style={{marginBottom: "1.5rem"}}>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            
          >
            <ArrowLeft  />
            Back
          </Button>
        </div>

        <Card >
          <CardHeader>
            <CardTitle  style={{textAlign: "center"}}>
              📜 Terms of Use
            </CardTitle>
            <p  style={{textAlign: "center"}}>
              Rules and guidelines for using Heinous Trivia
            </p>
          </CardHeader>
          <CardContent >
            <div >
              
              <section>
                <h2 >Acceptance of Terms</h2>
                <p>By accessing and using the Heinous Trivia platform, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you may not use our service.</p>
              </section>

              <section>
                <h2 >Platform Use</h2>
                <ul >
                  <li>• You may participate in trivia games hosted on this platform</li>
                  <li>• Haunt administrators may create and manage their own trivia experiences</li>
                  <li>• You must provide accurate information when required</li>
                  <li>• You are responsible for maintaining the security of your access credentials</li>
                  <li>• By using Pro and Premium features, you consent to analytics data collection for business insights</li>
                </ul>
              </section>

              <section>
                <h2 >Prohibited Activities</h2>
                <ul >
                  <li>• Do not upload inappropriate, offensive, or copyrighted content</li>
                  <li>• Do not attempt to hack, exploit, or damage the platform</li>
                  <li>• Do not impersonate other users or administrators</li>
                  <li>• Do not spam or abuse the communication features</li>
                </ul>
              </section>

              <section>
                <h2 >Content Guidelines</h2>
                <p>All content uploaded to the platform, including trivia questions and advertisements, must comply with our content guidelines. Haunt administrators are responsible for ensuring their content is appropriate and legal.</p>
              </section>

              <section>
                <h2 >Intellectual Property</h2>
                <p>You retain ownership of content you upload, but grant us a license to use it for platform functionality. You are responsible for ensuring you have the right to upload any content.</p>
              </section>

              <section>
                <h2 >Limitation of Liability</h2>
                <p>The platform is provided "as is" without warranties. We are not liable for any damages arising from your use of the service or content provided by haunt administrators.</p>
              </section>

              <section>
                <h2 >Termination</h2>
                <p>We reserve the right to terminate or suspend access to accounts that violate these terms or engage in prohibited activities.</p>
              </section>

              <section>
                <h2 >Changes to Terms</h2>
                <p>We may update these terms from time to time. Continued use of the platform constitutes acceptance of updated terms.</p>
              </section>

              <div >
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}