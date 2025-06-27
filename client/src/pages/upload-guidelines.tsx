import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function UploadGuidelines() {
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
              📋 Content Guidelines
            </CardTitle>
            <p  style={{textAlign: "center"}}>
              Guidelines for haunt administrators creating trivia content
            </p>
          </CardHeader>
          <CardContent >
            <div >
              
              <section>
                <h2 >
                  <CheckCircle  />
                  Trivia Questions - Best Practices
                </h2>
                <ul >
                  <li>• Write clear, unambiguous questions with definitive answers</li>
                  <li>• Provide 4 multiple choice options with only one correct answer</li>
                  <li>• Match your haunt's theme and difficulty level</li>
                  <li>• Test questions with others before publishing</li>
                  <li>• Keep questions family-friendly unless explicitly adult-themed</li>
                  <li>• Verify facts and cite sources for educational content</li>
                </ul>
              </section>

              <section>
                <h2 >
                  <CheckCircle  />
                  Advertisement Content - Approved
                </h2>
                <ul >
                  <li>• Local business promotions and event announcements</li>
                  <li>• Educational or informational content related to your haunt</li>
                  <li>• Community events and fundraisers</li>
                  <li>• Family-friendly entertainment and activities</li>
                  <li>• Images should be high quality (minimum 800x600 pixels)</li>
                  <li>• Keep file sizes under 5MB for optimal loading</li>
                </ul>
              </section>

              <section>
                <h2 >
                  <XCircle  />
                  Prohibited Content
                </h2>
                <ul >
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
                <h2 >
                  <AlertTriangle  />
                  Technical Requirements
                </h2>
                <div >
                  <h3 >Images</h3>
                  <ul >
                    <li>• Supported formats: JPG, PNG, GIF</li>
                    <li>• Maximum file size: 5MB</li>
                    <li>• Recommended dimensions: 1200x800 pixels</li>
                    <li>• Minimum dimensions: 800x600 pixels</li>
                  </ul>
                  
                  <h3 >Questions</h3>
                  <ul >
                    <li>• Question text: Maximum 500 characters</li>
                    <li>• Answer choices: Maximum 150 characters each</li>
                    <li>• Must have exactly 4 answer options</li>
                    <li>• One correct answer required</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 >Content Review Process</h2>
                <p>All uploaded content is subject to review. Content that violates these guidelines may be removed without notice. Repeated violations may result in account suspension.</p>
                
                <div >
                  <h3 >Need Help?</h3>
                  <p >If you're unsure whether your content meets these guidelines, contact the platform administrator before uploading. We're here to help you create engaging, appropriate content for your haunt!</p>
                </div>
              </section>

              <section>
                <h2 >Copyright and Fair Use</h2>
                <p>You are responsible for ensuring you have the right to use any content you upload. This includes:</p>
                <ul >
                  <li>• Images and graphics</li>
                  <li>• Questions adapted from other sources</li>
                  <li>• Brand names and logos in advertisements</li>
                  <li>• Music or audio files (if supported in future updates)</li>
                </ul>
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