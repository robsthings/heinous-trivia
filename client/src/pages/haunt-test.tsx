import { useState } from 'react';
import { generateHauntUrls, extractHauntId, isValidHauntId } from '@/lib/hauntUrls';

export default function HauntTest() {
  const [testHauntId, setTestHauntId] = useState('Sorcererslair');
  const [currentDetection, setCurrentDetection] = useState('');

  const handleDetectionTest = () => {
    const detected = extractHauntId();
    setCurrentDetection(detected || 'None detected');
  };

  const urls = generateHauntUrls(testHauntId);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-red-500">Haunt URL Testing System</h1>
        
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Test Haunt ID:</label>
          <input
            type="text"
            value={testHauntId}
            onChange={(e) => setTestHauntId(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 w-64"
            placeholder="Enter haunt ID"
          />
          <div className="mt-2 text-sm">
            Valid: {isValidHauntId(testHauntId) ? '✅' : '❌'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Generated URLs</h2>
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded">
                <h3 className="font-semibold text-green-400">Query Parameter (Development)</h3>
                <a href={urls.query} className="text-blue-400 hover:underline break-all">
                  {urls.query}
                </a>
              </div>
              
              <div className="bg-gray-800 p-4 rounded">
                <h3 className="font-semibold text-yellow-400">Hash Parameter (Production Fallback)</h3>
                <a href={urls.hash} className="text-blue-400 hover:underline break-all">
                  {urls.hash}
                </a>
              </div>
              
              <div className="bg-gray-800 p-4 rounded">
                <h3 className="font-semibold text-purple-400">Path-based (Production Alternative)</h3>
                <a href={urls.path} className="text-blue-400 hover:underline break-all">
                  {urls.path}
                </a>
              </div>
              
              <div className="bg-gray-800 p-4 rounded">
                <h3 className="font-semibold text-orange-400">Direct Hash (Simplest)</h3>
                <a href={urls.direct} className="text-blue-400 hover:underline break-all">
                  {urls.direct}
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Current Detection</h2>
            <div className="bg-gray-800 p-4 rounded mb-4">
              <div className="text-sm text-gray-400 mb-2">Current URL:</div>
              <div className="break-all">{window.location.href}</div>
            </div>
            
            <button
              onClick={handleDetectionTest}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded mb-4"
            >
              Test Detection
            </button>
            
            <div className="bg-gray-800 p-4 rounded">
              <div className="text-sm text-gray-400 mb-2">Detected Haunt ID:</div>
              <div className="text-lg font-bold text-green-400">
                {currentDetection || 'Click Test Detection'}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Manual Test URLs:</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <a href="/#haunt=Sorcererslair" className="text-blue-400 hover:underline">
                    Hash: /#haunt=Sorcererslair
                  </a>
                </div>
                <div>
                  <a href="/#Sorcererslair" className="text-blue-400 hover:underline">
                    Direct: /#Sorcererslair
                  </a>
                </div>
                <div>
                  <a href="/h/Sorcererslair" className="text-blue-400 hover:underline">
                    Path: /h/Sorcererslair
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Firebase Isolation Test</h2>
          <div className="bg-gray-800 p-4 rounded">
            <p className="text-gray-300">
              Each haunt should load its own Firebase configuration, questions, and branding.
              Test different haunts to verify proper isolation:
            </p>
            <div className="mt-4 space-x-4">
              <a href="/h/headquarters" className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                Headquarters
              </a>
              <a href="/h/Sorcererslair" className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm">
                Sorcererslair
              </a>
              <a href="/h/testhaunt" className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm">
                Test Haunt
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}