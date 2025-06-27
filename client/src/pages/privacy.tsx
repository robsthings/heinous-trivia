import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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
              🔒 Privacy Policy
            </CardTitle>
            <p  style={{textAlign: "center"}}>
              How we handle your data in the Heinous Trivia platform
            </p>
          </CardHeader>
          <CardContent >
            <div >
              
              <section>
                <h2 >Information We Collect</h2>
                <ul >
                  <li>• Player nicknames and game scores for leaderboard functionality</li>
                  <li>• Haunt admin authentication codes for secure access</li>
                  <li>• Custom trivia questions and advertisements uploaded by haunt operators</li>
                  <li>• Game session data including answers and participation metrics</li>
                  <li>• Analytics data for Pro and Premium subscribers including:</li>
                  <li >- Anonymous player identifiers for tracking return visits</li>
                  <li >- Question performance metrics and response times</li>
                  <li >- Advertisement interaction data (views and clicks)</li>
                  <li >- Session duration and completion rates</li>
                  <li >- Group play participation statistics</li>
                </ul>
              </section>

              <section>
                <h2 >How We Use Your Information</h2>
                <ul >
                  <li>• To provide trivia game functionality and maintain leaderboards</li>
                  <li>• To authenticate haunt administrators and protect their content</li>
                  <li>• To improve game performance and user experience</li>
                  <li>• To enable real-time multiplayer features and group gameplay</li>
                  <li>• To generate business analytics for Pro and Premium subscribers including:</li>
                  <li >- Player engagement and retention metrics</li>
                  <li >- Content performance analysis for trivia questions</li>
                  <li >- Advertisement effectiveness tracking</li>
                  <li >- Game session insights and completion rates</li>
                </ul>
              </section>

              <section>
                <h2 >Data Storage and Security</h2>
                <p>Your data is stored securely using Firebase services with industry-standard encryption. We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information.</p>
              </section>

              <section>
                <h2 >Data Retention and Analytics</h2>
                <p>Game scores and player data are retained for leaderboard functionality. Haunt configurations and custom content are maintained while the haunt remains active.</p>
                <p >For Pro and Premium subscribers, we collect anonymous analytics data to provide business insights. Player identifiers are randomized and cannot be linked to personal information. Analytics data is retained for up to 90 days to generate meaningful performance reports.</p>
                <p >You may request data deletion by contacting your haunt administrator.</p>
              </section>

              <section>
                <h2 >Third-Party Services</h2>
                <p>We use Firebase (Google) for data storage and authentication. Please review Google's privacy policy for information about their data practices.</p>
              </section>

              <section>
                <h2 >Contact</h2>
                <p>For privacy-related questions or requests, please contact your haunt administrator or the platform operator.</p>
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