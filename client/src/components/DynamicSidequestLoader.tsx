/**
 * Dynamic Sidequest Loader
 * 
 * Loads and renders sidequests dynamically from Firebase instead of hardcoded components
 */
import React, { lazy, Suspense } from 'react';
import { useSidequest } from '@/hooks/use-firebase-sidequests';
import { SpookyLoader } from '@/components/SpookyLoader';
import type { Sidequest } from '@shared/schema';

// Dynamic imports for existing sidequest components
const componentMap = {
  'monster-name-generator': lazy(() => import('@/pages/sidequests/MonsterNameGenerator').then(m => ({ default: m.MonsterNameGenerator }))),
  'glory-grab': lazy(() => import('@/pages/sidequests/GloryGrab').then(m => ({ default: m.GloryGrab }))),
  'chupacabra-challenge': lazy(() => import('@/pages/ChupacabraChallenge')),
  'cryptic-compliments': lazy(() => import('@/pages/sidequests/CrypticCompliments').then(m => ({ default: m.CrypticCompliments }))),

  'necromancers-gambit': lazy(() => import('@/pages/sidequests/NecromancersGambit').then(m => ({ default: m.NecromancersGambit }))),
  'spectral-memory': lazy(() => import('@/pages/sidequests/SpectralMemory').then(m => ({ default: m.SpectralMemory }))),
  'phantoms-puzzle': lazy(() => import('@/pages/sidequests/PhantomsPuzzle').then(m => ({ default: m.PhantomsPuzzle }))),
  'curse-crafting': lazy(() => import('@/sidequests/CurseCrafting').then(m => ({ default: m.CurseCrafting }))),
  'wack-a-chupacabra': lazy(() => import('@/sidequests/WackAChupacabra').then(m => ({ default: m.WackAChupacabra }))),
  'wretched-wiring': lazy(() => import('@/pages/sidequests/WretchedWiring').then(m => ({ default: m.WretchedWiring }))),
  'lab-escape': lazy(() => import('@/pages/lab-escape').then(m => ({ default: m.LabEscape }))),
  'face-the-chupacabra': lazy(() => import('@/components/sidequests/face-the-chupacabra').then(m => ({ default: m.FaceTheChupacabra })))
};

interface DynamicSidequestLoaderProps {
  sidequestId: string;
  className?: string;
}

export function DynamicSidequestLoader({ sidequestId, className = "" }: DynamicSidequestLoaderProps) {
  const { data: sidequest, isLoading, error } = useSidequest(sidequestId);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff'
      }} className={className}>
        <SpookyLoader message="Loading sidequest from the supernatural realm..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }} className={className}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            color: '#ef4444',
            marginBottom: '1rem'
          }}>Sidequest Unavailable</h1>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '1rem'
          }}>The supernatural forces are blocking this quest</p>
          <p style={{ color: '#9ca3af' }}>Error: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!sidequest) {
    return (
      <div className={`min-h-screen bg-black text-white flex items-center justify-center ${className}`}>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-purple-500 mb-4">Quest Not Found</h1>
          <p className="text-xl">This sidequest has vanished into the void</p>
        </div>
      </div>
    );
  }

  // Get the appropriate component for this sidequest
  const Component = componentMap[sidequestId as keyof typeof componentMap];

  if (!Component) {
    return (
      <div className={`min-h-screen bg-black text-white flex items-center justify-center ${className}`}>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-yello00 mb-4" style={{width: "1.25rem"}}>Quest Under Construction</h1>
          <p className="text-xl mb-4">{sidequest.name}</p>
          <p className="text-gray-400">{sidequest.description}</p>
          <p className="text-sm  mt-4" style={{color: "#6b7280"}}>Component type: {sidequest.componentType}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black text-white ${className}`}>
      <Suspense fallback={
        <SpookyLoader message={`Conjuring ${sidequest.name}...`} />
      }>
        <Component sidequestConfig={sidequest} />
      </Suspense>
    </div>
  );
}

/**
 * Sidequest List Component
 * 
 * Displays available sidequests from Firebase based on user tier
 */
interface SidequestListProps {
  tier?: string;
  onSelectSidequest: (sidequestId: string) => void;
  className?: string;
}

export function SidequestList({ tier = 'Basic', onSelectSidequest, className = "" }: SidequestListProps) {
  const { data: sidequests, isLoading, error } = useSidequests(tier);

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <SpookyLoader message="Loading available quests..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <h2 className="text-2xl font-bold text-red-500 mb-4">Failed to Load Quests</h2>
        <p className="text-gray-400">Error: {error.message}</p>
      </div>
    );
  }

  if (!sidequests || sidequests.length === 0) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <h2 className="text-2xl font-bold text-purple-500 mb-4">No Quests Available</h2>
        <p className="text-gray-400">Check back later for new supernatural challenges</p>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <h2 className="text-3xl font-bold text-purple-400 " className="mb-6">Available Sidequests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sidequests.map((sidequest) => (
          <SidequestCard
            key={sidequest.id}
            sidequest={sidequest}
            onSelect={() => onSelectSidequest(sidequest.id)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual Sidequest Card Component
 */
interface SidequestCardProps {
  sidequest: Sidequest;
  onSelect: () => void;
}

function SidequestCard({ sidequest, onSelect }: SidequestCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-orange-400';
      case 'Expert': return 'text-red-400';
      case 'Impossible': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Basic': return 'bg-blue-600';
      case 'Pro': return 'bg-purple-600';
      case 'Premium': return 'bg-gold-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div 
      className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 cursor-pointer transition-all duration-300 hover:transform hover:scale-105"
      onClick={onSelect}
    >
      <div className="  items-start mb-3" style={{justifyContent: "space-between"}} style={{display: "flex"}}>
        <h3 className="text-xl font-bold text-white">{sidequest.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-bold ${getTierColor(sidequest.requiredTier)}`}>
          {sidequest.requiredTier}
        </span>
      </div>
      
      <p className=" mb-4 text-sm leading-relaxed" className="text-gray-300">
        {sidequest.description}
      </p>
      
      <div  style={{justifyContent: "space-between"}} style={{alignItems: "center"}} style={{display: "flex"}}>
        <span className={`font-semibold ${getDifficultyColor(sidequest.difficulty)}`}>
          {sidequest.difficulty}
        </span>
        <span className=" text-sm" className="text-gray-400">
          {sidequest.estimatedTime}
        </span>
      </div>
    </div>
  );
}

export default DynamicSidequestLoader;