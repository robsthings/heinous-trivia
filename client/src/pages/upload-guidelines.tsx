import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function UploadGuidelines() {
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
              📋 Content Guidelines
            </CardTitle>
            <p className="text-gray-300 text-center">
              Guidelines for haunt administrators creating trivia content
            </p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div className="text-gray-300 space-y-6">
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Trivia Questions - Best Practices
                </h2>
                <ul className="space-y-2">
                  <li>• Write clear, unambiguous questions with definitive answers</li>
                  <li>• Provide 4 multiple choice options with only one correct answer</li>
                  <li>• Match your haunt's theme and difficulty level</li>
                  <li>• Test questions with others before publishing</li>
                  <li>• Keep questions family-friendly unless explicitly adult-themed</li>
                  <li>• Verify facts and cite sources for educational content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Advertisement Content - Approved
                </h2>
                <ul className="space-y-2">
                  <li>• Local business promotions and event announcements</li>
                  <li>• Educational or informational content related to your haunt</li>
                  <li>• Community events and fundraisers</li>
                  <li>• Family-friendly entertainment and activities</li>
                  <li>• Images should be high quality (minimum 800x600 pixels)</li>
                  <li>• Keep file sizes under 5MB for optimal loading</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Prohibited Content
                </h2>
                <ul className="space-y-2">
                  <li>• Copyrighted material without proper licensing</li>
                  <li>• Explicit sexual content or nudity</li>
                  <li>• Hate speech, discrimination, or harassment</li>
                  <li>• Violence or graphic content inappropriate for your audience</li>
                  <li>• Illegal activities or substances</li>
                  <li>• Misleading or false advertising claims</li>
                  <li>• Personal information or contact details of private individuals</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Technical Requirements
                </h2>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Images</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Supported formats: JPG, PNG, GIF</li>
                    <li>• Maximum file size: 5MB</li>
                    <li>• Recommended dimensions: 1200x800 pixels</li>
                    <li>• Minimum dimensions: 800x600 pixels</li>
                  </ul>
                  
                  <h3 className="font-semibold text-white mb-2 mt-4">Questions</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Question text: Maximum 500 characters</li>
                    <li>• Answer choices: Maximum 150 characters each</li>
                    <li>• Must have exactly 4 answer options</li>
                    <li>• One correct answer required</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Content Review Process</h2>
                <p>All uploaded content is subject to review. Content that violates these guidelines may be removed without notice. Repeated violations may result in account suspension.</p>
                
                <div className="bg-blue-900/30 p-4 rounded-lg mt-4">
                  <h3 className="font-semibold text-blue-300 mb-2">Need Help?</h3>
                  <p className="text-sm">If you're unsure whether your content meets these guidelines, contact the platform administrator before uploading. We're here to help you create engaging, appropriate content for your haunt!</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Copyright and Fair Use</h2>
                <p>You are responsible for ensuring you have the right to use any content you upload. This includes:</p>
                <ul className="space-y-2 mt-2">
                  <li>• Images and graphics</li>
                  <li>• Questions adapted from other sources</li>
                  <li>• Brand names and logos in advertisements</li>
                  <li>• Music or audio files (if supported in future updates)</li>
                </ul>
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