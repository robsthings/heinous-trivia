import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
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
            <CardTitle className="text-3xl font-bold text-red-500 text-center">
              📜 Terms of Use
            </CardTitle>
            <p className="text-gray-300 text-center">
              Rules and guidelines for using Heinous Trivia
            </p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div className="text-gray-300 space-y-6">
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Acceptance of Terms</h2>
                <p>By accessing and using the Heinous Trivia platform, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you may not use our service.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Platform Use</h2>
                <ul className="space-y-2">
                  <li>• You may participate in trivia games hosted on this platform</li>
                  <li>• Haunt administrators may create and manage their own trivia experiences</li>
                  <li>• You must provide accurate information when required</li>
                  <li>• You are responsible for maintaining the security of your access credentials</li>
                  <li>• By using Pro and Premium features, you consent to analytics data collection for business insights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Prohibited Activities</h2>
                <ul className="space-y-2">
                  <li>• Do not upload inappropriate, offensive, or copyrighted content</li>
                  <li>• Do not attempt to hack, exploit, or damage the platform</li>
                  <li>• Do not impersonate other users or administrators</li>
                  <li>• Do not spam or abuse the communication features</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Content Guidelines</h2>
                <p>All content uploaded to the platform, including trivia questions and advertisements, must comply with our content guidelines. Haunt administrators are responsible for ensuring their content is appropriate and legal.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Intellectual Property</h2>
                <p>You retain ownership of content you upload, but grant us a license to use it for platform functionality. You are responsible for ensuring you have the right to upload any content.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h2>
                <p>The platform is provided "as is" without warranties. We are not liable for any damages arising from your use of the service or content provided by haunt administrators.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Termination</h2>
                <p>We reserve the right to terminate or suspend access to accounts that violate these terms or engage in prohibited activities.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Changes to Terms</h2>
                <p>We may update these terms from time to time. Continued use of the platform constitutes acceptance of updated terms.</p>
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