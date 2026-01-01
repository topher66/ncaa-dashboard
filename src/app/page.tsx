'use client';
import { useEffect, useState, useCallback } from 'react';

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
  paceVsAverage: number;
  overUnderEdge: 'OVER LEAN' | 'UNDER LEAN' | 'NEUTRAL';
  gameTempo: 'HOT 🔥' | 'COLD 🥶' | 'NEUTRAL';
  blowoutRisk: number; // Percentage
}

// Demo data with varied tempo classifications
const DEMO_GAMES: Game[] = [
  {
    id: 'demo1',
    homeTeam: 'Duke Blue Devils',
    awayTeam: 'North Carolina Tar Heels',
    homeScore: 72,
    awayScore: 68,
    clock: '8:45 - 2nd Half',
    period: 2,
    pace: 82,  // High pace = HOT
    projectedTotal: 145,
    paceVsAverage: 12,  // +12 over average = HOT
    overUnderEdge: 'OVER LEAN',
    gameTempo: 'HOT 🔥',
    blowoutRisk: 15
  },
  {
    id: 'demo2',
    homeTeam: 'Kentucky Wildcats',
    awayTeam: 'Louisville Cardinals',
    homeScore: 45,
    awayScore: 48,
    clock: '12:30 - 2nd Half',
    period: 2,
    pace: 58,  // Low pace = COLD
    projectedTotal: 128,
    paceVsAverage: -12,  // -12 under average = COLD
    overUnderEdge: 'UNDER LEAN',
    gameTempo: 'COLD 🥶',
    blowoutRisk: 5
  },
  {
    id: 'demo3',
    homeTeam: 'Gonzaga Bulldogs',
    awayTeam: 'UCLA Bruins',
    homeScore: 58,
    awayScore: 55,
    clock: '15:22 - 2nd Half',
    period: 2,
    pace: 71,  // Average pace = NEUTRAL
    projectedTotal: 135,
    paceVsAverage: 1,  // +1 over average = NEUTRAL
    overUnderEdge: 'NEUTRAL',
    gameTempo: 'NEUTRAL',
    blowoutRisk: 8
  },
  {
    id: 'demo4',
    homeTeam: 'Michigan State Spartans',
    awayTeam: 'Purdue Boilermakers',
    homeScore: 61,
    awayScore: 59,
    clock: '6:15 - 2nd Half',
    period: 2,
    pace: 75,
    projectedTotal: 138,
    paceVsAverage: 5,
    overUnderEdge: 'OVER LEAN',
    gameTempo: 'NEUTRAL',
    blowoutRisk: 3
  }
];

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard');
      const data = await res.json();

      const liveGames: Game[] = data.events
        .filter((event: any) => event.status.type.name !== 'STATUS_FINAL' && event.competitions[0].status.type.detail.includes(' - '))
        .map((event: any) => {
          const comp = event.competitions[0];
          const home = comp.competitors.find((c: any) => c.homeAway === 'home');
          const away = comp.competitors.find((c: any) => c.homeAway === 'away');

          const clockParts = comp.status.clockDisplayValue ? comp.status.clockDisplayValue.split(':') : ['0', '00'];
          const minutesLeftInPeriod = parseInt(clockParts[0]) + parseInt(clockParts[1]) / 60;
          const period = comp.status.period;

          const minutesPlayed = period <= 1 ? (20 - minutesLeftInPeriod) : (40 - minutesLeftInPeriod);
          const totalPoints = parseInt(home?.score || '0') + parseInt(away?.score || '0');
          const pace = minutesPlayed > 0 ? (totalPoints / minutesPlayed) * 40 : 0;
          const minutesRemaining = period <= 1 ? 20 + minutesLeftInPeriod : minutesLeftInPeriod;
          const projectedTotal = Math.round(totalPoints + (pace / 40) * minutesRemaining);

          // --- Enhanced Betting Logic ---
          const averageNCAAPace = 70; // NCAA Men's Basketball average
          const paceVsAverage = Math.round(pace - averageNCAAPace);

          // More nuanced O/U logic
          let overUnderEdge: 'OVER LEAN' | 'UNDER LEAN' | 'NEUTRAL' = 'NEUTRAL';
          if (pace > 75 && projectedTotal > 140) {
            overUnderEdge = 'OVER LEAN';
          } else if (pace < 65 && projectedTotal < 130) {
            overUnderEdge = 'UNDER LEAN';
          } else if (paceVsAverage > 8) {
            overUnderEdge = 'OVER LEAN';
          } else if (paceVsAverage < -8) {
            overUnderEdge = 'UNDER LEAN';
          }

          // Fixed tempo classification
          let gameTempo: 'HOT 🔥' | 'COLD 🥶' | 'NEUTRAL' = 'NEUTRAL';
          if (pace > 78 || paceVsAverage > 10) {
            gameTempo = 'HOT 🔥';
          } else if (pace < 62 || paceVsAverage < -10) {
            gameTempo = 'COLD 🥶';
          }

          const scoreDifference = Math.abs(parseInt(home?.score || '0') - parseInt(away?.score || '0'));
          const blowoutRisk = scoreDifference > 15 ? Math.min(100, (scoreDifference - 15) * 5) : 0;

          return {
            id: event.id,
            homeTeam: home.team.displayName,
            awayTeam: away.team.displayName,
            homeScore: parseInt(home.score || '0'),
            awayScore: parseInt(away.score || '0'),
            clock: comp.status.type.detail,
            period,
            pace: Math.round(pace),
            projectedTotal,
            paceVsAverage,
            overUnderEdge,
            gameTempo,
            blowoutRisk,
          };
        });

      if (liveGames.length === 0) {
        // No live games, show demo data
        setGames(DEMO_GAMES);
      } else {
        setGames(liveGames);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      // On error, show demo data
      setGames(DEMO_GAMES);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 8000);
    return () => clearInterval(interval);
  }, [fetchScores]);

  const gamesToDisplay = games.length > 0 ? games : DEMO_GAMES;
  const isDemo = games.length === 0 || games === DEMO_GAMES;

  return (
    <main className="main-container">
      <div className="header-container">
        <h1 className="main-title">🏀 Live NCAA Betting Analytics</h1>
        <div className="gradient-line"></div>
        <p className="subtitle">Real-time pace analysis & betting insights</p>
        {isDemo && (
          <p className="demo-mode-badge">🎮 DEMO MODE - No live games today</p>
        )}
      </div>

      {loading && games.length === 0 ? (
        <div className="loading-spinner"></div>
      ) : gamesToDisplay.length === 0 ? (
        <p className="no-games-message">Go build Legos.</p>
      ) : (
        <div className="game-grid">
          {gamesToDisplay.map((game) => (
            <div key={game.id} className="game-card">
              <div className="game-clock">{game.clock}</div>
              <div className="team-scores">
                <div className="team-row">
                  <span className="team-name">{game.awayTeam}</span>
                  <span className="score">{game.awayScore}</span>
                </div>
                <div className="team-row">
                  <span className="team-name">{game.homeTeam}</span>
                  <span className="score">{game.homeScore}</span>
                </div>
              </div>
              <div className="game-stats">
                <div className="stat-row">
                  <span className="stat-label">Current Pace:</span>
                  <span className="stat-value pace-value">{game.pace} pts/40 min</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Projected Final Total:</span>
                  <span className="stat-value projected-total-value">{game.projectedTotal}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Pace vs Average:</span>
                  <span className={`stat-value pace-vs-average ${game.paceVsAverage > 0 ? 'text-green-300' : game.paceVsAverage < 0 ? 'text-red-300' : 'text-gray-400'}`}>
                    {game.paceVsAverage > 0 ? '+' : ''}{game.paceVsAverage}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">O/U Edge:</span>
                  <span className={`stat-value ${game.overUnderEdge === 'OVER LEAN' ? 'text-green-300' : game.overUnderEdge === 'UNDER LEAN' ? 'text-red-300' : 'text-gray-400'}`}>
                    {game.overUnderEdge}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Game Tempo:</span>
                  <span className={`stat-value ${game.gameTempo === 'HOT 🔥' ? 'text-red-300' : game.gameTempo === 'COLD 🥶' ? 'text-blue-300' : 'text-gray-400'}`}>
                    {game.gameTempo}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Blowout Risk:</span>
                  <span className={`stat-value blowout-value ${game.blowoutRisk > 70 ? 'text-red-300' : game.blowoutRisk > 40 ? 'text-yellow-300' : game.blowoutRisk > 15 ? 'text-orange-300' : 'text-green-300'} font-bold`}>
                    {game.blowoutRisk}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}