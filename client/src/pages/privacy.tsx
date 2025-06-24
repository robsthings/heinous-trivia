import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with back button */}
        <div className="flex items-center gap-4 " style={{marginBottom: "1.5rem"}}>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="bg-black/80 border-red-600">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-red-500 " style={{textAlign: "center"}}>
              🔒 Privacy Policy
            </CardTitle>
            <p className="text-gray-300 " style={{textAlign: "center"}}>
              How we handle your data in the Heinous Trivia platform
            </p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div className="text-gray-300 space-y-6">
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Information We Collect</h2>
                <ul className="space-y-2">
                  <li>• Player nicknames and game scores for leaderboard functionality</li>
                  <li>• Haunt admin authentication codes for secure access</li>
                  <li>• Custom trivia questions and advertisements uploaded by haunt operators</li>
                  <li>• Game session data including answers and participation metrics</li>
                  <li>• Analytics data for Pro and Premium subscribers including:</li>
                  <li className="ml-6">- Anonymous player identifiers for tracking return visits</li>
                  <li className="ml-6">- Question performance metrics and response times</li>
                  <li className="ml-6">- Advertisement interaction data (views and clicks)</li>
                  <li className="ml-6">- Session duration and completion rates</li>
                  <li className="ml-6">- Group play participation statistics</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h2>
                <ul className="space-y-2">
                  <li>• To provide trivia game functionality and maintain leaderboards</li>
                  <li>• To authenticate haunt administrators and protect their content</li>
                  <li>• To improve game performance and user experience</li>
                  <li>• To enable real-time multiplayer features and group gameplay</li>
                  <li>• To generate business analytics for Pro and Premium subscribers including:</li>
                  <li className="ml-6">- Player engagement and retention metrics</li>
                  <li className="ml-6">- Content performance analysis for trivia questions</li>
                  <li className="ml-6">- Advertisement effectiveness tracking</li>
                  <li className="ml-6">- Game session insights and completion rates</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Data Storage and Security</h2>
                <p>Your data is stored securely using Firebase services with industry-standard encryption. We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Data Retention and Analytics</h2>
                <p>Game scores and player data are retained for leaderboard functionality. Haunt configurations and custom content are maintained while the haunt remains active.</p>
                <p className="mt-2">For Pro and Premium subscribers, we collect anonymous analytics data to provide business insights. Player identifiers are randomized and cannot be linked to personal information. Analytics data is retained for up to 90 days to generate meaningful performance reports.</p>
                <p className="mt-2">You may request data deletion by contacting your haunt administrator.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Third-Party Services</h2>
                <p>We use Firebase (Google) for data storage and authentication. Please review Google's privacy policy for information about their data practices.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
                <p>For privacy-related questions or requests, please contact your haunt administrator or the platform operator.</p>
              </section>

              <div className="text-sm text-gray-400 mt-8 pt-4 border-t border-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}