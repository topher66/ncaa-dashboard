'use client';

import { useEffect, useState } from 'react';

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  clock: string;
  period: number;
  pace: number;
  projectedTotal: number;
  bettingInsights: {
    paceVsAverage: number;
    overUnderEdge: string;
    momentum: 'HOT' | 'COLD' | 'NEUTRAL';
    blowoutRisk: number;
  };
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = async () => {
    try {
      const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard');
      const data = await res.json();

      const liveGames: Game[] = data.events
        .filter((event: unknown) => {
          const e = event as { status: { type: { name: string } }, competitions: Array<{ status: { type: { detail: string } } }> };
          return e.status.type.name !== 'STATUS_FINAL' && e.competitions[0].status.type.detail.includes(' - ');
        })
        .map((event: unknown) => {
          const e = event as {
            id: string;
            competitions: Array<{
              competitors: Array<{
                homeAway: string;
                team: { displayName: string };
                score?: string;
              }>;
              status: {
                clockDisplayValue?: string;
                period: number;
                type: { detail: string };
              };
            }>;
          };
          const comp = e.competitions[0];
          const home = comp.competitors.find((c) => c.homeAway === 'home');
          const away = comp.competitors.find((c) => c.homeAway === 'away');

          const clockParts = comp.status.clockDisplayValue ? comp.status.clockDisplayValue.split(':') : ['0', '00'];
          const minutesLeftInPeriod = parseInt(clockParts[0]) + parseInt(clockParts[1]) / 60;
          const period = comp.status.period;

          const minutesPlayed = period <= 1 ? (20 - minutesLeftInPeriod) : (40 - minutesLeftInPeriod);
          const totalPoints = parseInt(home?.score || '0') + parseInt(away?.score || '0');
          const pace = minutesPlayed > 0 ? (totalPoints / minutesPlayed) * 40 : 0;
          const minutesRemaining = period <= 1 ? 20 + minutesLeftInPeriod : minutesLeftInPeriod;
          const projectedTotal = Math.round(totalPoints + (pace / 40) * minutesRemaining);

          // Betting insights calculations
          const avgCollegePace = 70;
          const paceVsAverage = pace - avgCollegePace;
          const scoreDiff = Math.abs(parseInt(home?.score || '0') - parseInt(away?.score || '0'));
          const blowoutRisk = Math.min(100, (scoreDiff / 20) * 100);
          
          let overUnderEdge = 'NEUTRAL';
          if (projectedTotal > 145) overUnderEdge = 'OVER LEAN';
          else if (projectedTotal < 130) overUnderEdge = 'UNDER LEAN';
          
          let momentum = 'NEUTRAL' as 'HOT' | 'COLD' | 'NEUTRAL';
          if (pace > 75) momentum = 'HOT';
          else if (pace < 65) momentum = 'COLD';

          return {
            id: e.id,
            homeTeam: home?.team.displayName || 'Unknown',
            awayTeam: away?.team.displayName || 'Unknown',
            homeScore: parseInt(home?.score || '0'),
            awayScore: parseInt(away?.score || '0'),
            clock: comp.status.type.detail,
            period,
            pace: Math.round(pace),
            projectedTotal,
            bettingInsights: {
              paceVsAverage: Math.round(paceVsAverage),
              overUnderEdge,
              momentum,
              blowoutRisk: Math.round(blowoutRisk)
            }
          };
        });

      setGames(liveGames);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadScores = async () => {
      if (isMounted) {
        await fetchScores();
      }
    };
    
    loadScores();
    const interval = setInterval(loadScores, 8000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-2">🏀 Live NCAA Betting Analytics</h1>
      <p className="text-center text-gray-400 mb-8">Real-time pace analysis & betting insights</p>
      
      {loading ? (
        <p className="text-center text-xl">Loading live games...</p>
      ) : games.length === 0 ? (
        <div className="text-center mt-32">
          <p className="text-3xl font-bold text-yellow-300 mb-4">Go build Legos.</p>
          <p className="text-gray-400">No live games right now. Check back during basketball season!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {games.map((game) => (
            <div key={game.id} className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
              <div className="text-center text-sm text-gray-400 mb-2">{game.clock}</div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{game.awayTeam}</span>
                  <span className="text-2xl font-bold">{game.awayScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{game.homeTeam}</span>
                  <span className="text-2xl font-bold">{game.homeScore}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-700 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current Pace:</span>
                  <span className="font-bold text-yellow-400">{game.pace} pts/40 min</span>
                </div>
                <div className="flex justify-between">
                  <span>Projected Final Total:</span>
                  <span className="font-bold text-green-400">{game.projectedTotal}</span>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-600">
                  <div className="text-xs text-gray-300 mb-2 font-semibold">🎯 BETTING INSIGHTS</div>
                  
                  <div className="flex justify-between items-center mb-1">
                    <span>Pace vs Average:</span>
                    <span className={`font-bold ${game.bettingInsights.paceVsAverage > 0 ? 'text-red-400' : 'text-blue-400'}`}>
                      {game.bettingInsights.paceVsAverage > 0 ? '+' : ''}{game.bettingInsights.paceVsAverage}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-1">
                    <span>O/U Edge:</span>
                    <span className={`font-bold text-xs px-2 py-1 rounded ${
                      game.bettingInsights.overUnderEdge === 'OVER LEAN' ? 'bg-red-900 text-red-200' :
                      game.bettingInsights.overUnderEdge === 'UNDER LEAN' ? 'bg-blue-900 text-blue-200' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {game.bettingInsights.overUnderEdge}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-1">
                    <span>Game Tempo:</span>
                    <span className={`font-bold text-xs px-2 py-1 rounded ${
                      game.bettingInsights.momentum === 'HOT' ? 'bg-orange-900 text-orange-200' :
                      game.bettingInsights.momentum === 'COLD' ? 'bg-cyan-900 text-cyan-200' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {game.bettingInsights.momentum}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Blowout Risk:</span>
                    <span className={`font-bold ${
                      game.bettingInsights.blowoutRisk > 60 ? 'text-red-400' :
                      game.bettingInsights.blowoutRisk > 30 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {game.bettingInsights.blowoutRisk}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}