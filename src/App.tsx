import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameScene } from './three/gameScene';
import { generateLevels } from './math/mathGenerator';
import { sound } from './audio/soundEngine';
import { 
  PlayerProgress, 
  GameStatus, 
  LevelInfo, 
  MathQuestion, 
  MathCategory 
} from './types/game';

import { HUD } from './components/HUD';
import { MathGateBanner } from './components/MathGateBanner';
import { TouchControls } from './components/TouchControls';
import { MainMenu } from './components/MainMenu';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { ShopModal } from './components/ShopModal';
import { StatsModal } from './components/StatsModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { DailyRewardModal, DAILY_REWARDS } from './components/DailyRewardModal';
import { GAME_CHARACTERS } from './config/characters';

const STORAGE_KEY = 'math_run_3d_player_data_v1';

const INITIAL_PROGRESS: PlayerProgress = {
  coins: 100, // Starter coins
  gems: 10,
  currentLevel: 1,
  highestLevelUnlocked: 100, // All 100 stages are accessible
  highScore: 0,
  totalDistance: 0,
  totalCorrectAnswers: 0,
  totalWrongAnswers: 0,
  categoryStats: {
    addition: { correct: 0, total: 0 },
    subtraction: { correct: 0, total: 0 },
    multiplication: { correct: 0, total: 0 },
    division: { correct: 0, total: 0 },
    order_of_ops: { correct: 0, total: 0 },
    fractions: { correct: 0, total: 0 },
    algebra: { correct: 0, total: 0 },
    mixed: { correct: 0, total: 0 }
  },
  equippedSkin: 'athletic_runner',
  equippedThruster: 'cyan',
  unlockedSkins: ['athletic_runner', 'classic'],
  unlockedThrusters: ['cyan'],
  powerUpLevels: {
    shield: 1,
    magnet: 1,
    multiplier: 1,
    slowmo: 1,
    turbo: 1
  },
  audioEnabled: true,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  voiceTtsEnabled: true,
  controlsMode: 'both',
  graphicsQuality: 'high',
  consecutiveLoginDays: 1,
  hasClaimedDailyToday: false,
  lastLoginDate: ''
};

export default function App() {
  // Load saved progress or default
  const [progress, setProgress] = useState<PlayerProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...INITIAL_PROGRESS, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return INITIAL_PROGRESS;
  });

  const [levels] = useState<LevelInfo[]>(() => generateLevels());
  const [status, setStatus] = useState<GameStatus>('menu');
  const [isEndless, setIsEndless] = useState<boolean>(false);
  const [currentLevel, setCurrentLevel] = useState<LevelInfo>(() => levels[0]);

  // Live in-game states
  const [score, setScore] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [coinsRun, setCoinsRun] = useState<number>(0);
  const [gemsRun, setGemsRun] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [currentLane, setCurrentLane] = useState<number>(0);
  const [upcomingQuestion, setUpcomingQuestion] = useState<MathQuestion | null>(null);
  const [activePowerups, setActivePowerups] = useState<{ [key: string]: number }>({});
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [mathHistory, setMathHistory] = useState<{ question: MathQuestion; isCorrect: boolean; chosenOption: number }[]>([]);
  const [victoryStats, setVictoryStats] = useState<{ stars: number; accuracy: number }>({ stars: 3, accuracy: 100 });
  const [showDailyReward, setShowDailyReward] = useState<boolean>(false);

  // 3D Scene Ref & Mounting
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const gameSceneRef = useRef<GameScene | null>(null);

  // Daily Login Reward verification
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (progress.lastLoginDate !== todayStr) {
      let streak = progress.consecutiveLoginDays || 1;
      if (progress.lastLoginDate) {
        const lastDate = new Date(progress.lastLoginDate);
        const todayDate = new Date(todayStr);
        const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          streak = (streak % 7) + 1;
        } else if (diffDays > 1) {
          streak = 1;
        }
      }

      setProgress(prev => ({
        ...prev,
        highestLevelUnlocked: 100, // Ensure all stages stay unlocked
        consecutiveLoginDays: streak,
        hasClaimedDailyToday: false
      }));

      // Automatically show the Daily Reward popup on Main Menu
      setShowDailyReward(true);
    }
  }, []);

  // Handle claiming the daily reward
  const handleClaimDailyReward = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const streak = Math.max(1, Math.min(7, progress.consecutiveLoginDays || 1));
    const reward = DAILY_REWARDS[streak - 1];

    setProgress(prev => ({
      ...prev,
      coins: prev.coins + reward.coins,
      gems: prev.gems + reward.gems,
      lastLoginDate: todayStr,
      hasClaimedDailyToday: true
    }));
  };

  // Sync progress to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignored
    }
  }, [progress]);

  // Audio Sync
  useEffect(() => {
    sound.setVolumes(progress.musicVolume, progress.sfxVolume, !progress.audioEnabled);
    sound.voiceEnabled = progress.voiceTtsEnabled;
  }, [progress.audioEnabled, progress.musicVolume, progress.sfxVolume, progress.voiceTtsEnabled]);

  // Character appearance resolver
  const getCharacterOptions = useCallback(() => {
    // Check in realistic GAME_CHARACTERS first
    const char = GAME_CHARACTERS.find(c => c.id === progress.equippedSkin);
    if (char) {
      return {
        modelType: char.modelType,
        hoodieColor: char.hoodieColor,
        pantsColor: char.pantsColor,
        hairColor: char.hairColor,
        backpackColor: char.backpackColor,
        accentColor: char.accentColor,
        thrusterColorHex: char.thrusterColorHex
      };
    }

    const skinMap: Record<string, { hoodie: string; pants: string; hair: string; backpack: string }> = {
      classic: { hoodie: '#0284c7', pants: '#0f172a', hair: '#1e293b', backpack: '#06b6d4' },
      cosmic_runner: { hoodie: '#1d4ed8', pants: '#090d16', hair: '#1e1b4b', backpack: '#06b6d4' },
      cyber_neon: { hoodie: '#0284c7', pants: '#09090b', hair: '#38bdf8', backpack: '#06b6d4' },
      golden_champ: { hoodie: '#eab308', pants: '#78350f', hair: '#fef08a', backpack: '#f59e0b' },
      volcano_blaze: { hoodie: '#ea580c', pants: '#27272a', hair: '#f97316', backpack: '#c2410c' },
      emerald_sage: { hoodie: '#059669', pants: '#064e3b', hair: '#10b981', backpack: '#34d399' }
    };

    const thrusterMap: Record<string, number> = {
      cyan: 0x38bdf8,
      solar: 0xf97316,
      emerald: 0x10b981,
      violet: 0xa855f7
    };

    const s = skinMap[progress.equippedSkin] || skinMap.classic;
    const th = thrusterMap[progress.equippedThruster] || 0x38bdf8;

    return {
      modelType: 'athletic_runner' as const,
      hoodieColor: s.hoodie,
      pantsColor: s.pants,
      hairColor: s.hair,
      backpackColor: s.backpack,
      accentColor: '#38bdf8',
      thrusterColorHex: th
    };
  }, [progress.equippedSkin, progress.equippedThruster]);

  // Sync real-time 3D character changes when skin or thruster changes
  useEffect(() => {
    if (gameSceneRef.current) {
      const charOptions = getCharacterOptions();
      gameSceneRef.current.changeCharacter(charOptions);
    }
  }, [progress.equippedSkin, progress.equippedThruster, getCharacterOptions]);

  // Initialize GameScene inside useRef container
  useEffect(() => {
    if (!canvasMountRef.current) return;


    const charOptions = getCharacterOptions();

    const callbacks = {
      onScoreUpdate: (s: number, d: number) => {
        setScore(s);
        setDistance(d);
        if (gameSceneRef.current) {
          setCurrentLane(gameSceneRef.current.currentLane);

          // Update upcoming gate banner well in advance (-160) so player has thinking time
          const nextGate = gameSceneRef.current.trackManager.gates.find(
            g => !g.data.resolved && g.mesh.position.z < 0 && g.mesh.position.z > -160
          );
          setUpcomingQuestion(nextGate ? nextGate.data.question : null);
        }
      },
      onCoinCollected: (count: number, isGem: boolean) => {
        setCoinsRun(count);
        if (isGem) setGemsRun(prev => prev + 1);
      },
      onMathGatePassed: (question: MathQuestion, isCorrect: boolean, chosenOption: number) => {
        setMathHistory(prev => [...prev, { question, isCorrect, chosenOption }]);
        setQuestionsAnswered(prev => prev + 1);

        // Update statistics
        setProgress(prev => {
          const cat = question.category as MathCategory;
          const currentCat = prev.categoryStats[cat] || { correct: 0, total: 0 };

          return {
            ...prev,
            totalCorrectAnswers: isCorrect ? prev.totalCorrectAnswers + 1 : prev.totalCorrectAnswers,
            totalWrongAnswers: !isCorrect ? prev.totalWrongAnswers + 1 : prev.totalWrongAnswers,
            categoryStats: {
              ...prev.categoryStats,
              [cat]: {
                correct: isCorrect ? currentCat.correct + 1 : currentCat.correct,
                total: currentCat.total + 1
              }
            }
          };
        });
      },
      onPowerupActivated: (type: string, duration: number) => {
        setActivePowerups(prev => ({ ...prev, [type]: duration }));
      },
      onCollisionHurt: (livesLeft: number) => {
        setLives(livesLeft);
      },
      onGameOver: (reason: string) => {
        setGameOverReason(reason);
        setStatus('gameover');
        sound.stopMusic();

        // Save high score and earned coins
        setProgress(prev => ({
          ...prev,
          coins: prev.coins + coinsRun,
          gems: prev.gems + gemsRun,
          totalDistance: prev.totalDistance + distance,
          highScore: Math.max(prev.highScore, score)
        }));
      },
      onVictory: () => {
        setStatus('victory');
        sound.stopMusic();

        // Calculate stars
        const totalAnswers = mathHistory.length + 1; // including last one
        const correctAnswers = mathHistory.filter(m => m.isCorrect).length + 1;
        const acc = (correctAnswers / totalAnswers) * 100;
        let stars = 1;
        if (acc >= 90 && lives === 3) stars = 3;
        else if (acc >= 70) stars = 2;

        setVictoryStats({ stars, accuracy: acc });

        // Update progress & unlock next level
        setProgress(prev => {
          const nextLvl = Math.min(100, currentLevel.levelNumber + 1);
          return {
            ...prev,
            coins: prev.coins + coinsRun + 100, // +100 stage clear bonus
            gems: prev.gems + gemsRun + 2,
            highestLevelUnlocked: Math.max(prev.highestLevelUnlocked, nextLvl),
            currentLevel: nextLvl,
            totalDistance: prev.totalDistance + distance,
            highScore: Math.max(prev.highScore, score)
          };
        });
      }
    };

    const scene = new GameScene(
      canvasMountRef.current,
      currentLevel.world,
      currentLevel.category,
      currentLevel.difficulty,
      callbacks,
      charOptions
    );

    scene.isPaused = true; // start paused while on menu
    gameSceneRef.current = scene;

    return () => {
      scene.dispose();
      gameSceneRef.current = null;
    };
  }, [currentLevel.world, currentLevel.category, currentLevel.difficulty, getCharacterOptions]);

  // Powerup timer countdown interval
  useEffect(() => {
    if (status !== 'playing') return;

    const interval = setInterval(() => {
      setActivePowerups(prev => {
        const next: { [key: string]: number } = {};
        let changed = false;
        Object.entries(prev).forEach(([k, v]) => {
          if (v > 0.5) {
            next[k] = v - 0.5;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [status]);

  // Start Playing Campaign
  const handleStartCampaign = (lvl?: LevelInfo) => {
    const targetLvl = lvl || currentLevel;
    setCurrentLevel(targetLvl);
    setIsEndless(false);
    setScore(0);
    setDistance(0);
    setCoinsRun(0);
    setGemsRun(0);
    setLives(3);
    setQuestionsAnswered(0);
    setMathHistory([]);
    setActivePowerups({});
    setStatus('playing');

    if (gameSceneRef.current) {
      gameSceneRef.current.restart(
        targetLvl.world,
        targetLvl.category,
        targetLvl.difficulty,
        targetLvl.questionsCount,
        targetLvl.baseSpeed,
        false
      );
      gameSceneRef.current.isPaused = false;
    }

    sound.startMusic();
  };

  // Start Playing Endless Mode
  const handleStartEndless = () => {
    setIsEndless(true);
    setScore(0);
    setDistance(0);
    setCoinsRun(0);
    setGemsRun(0);
    setLives(3);
    setQuestionsAnswered(0);
    setMathHistory([]);
    setActivePowerups({});
    setStatus('playing');

    if (gameSceneRef.current) {
      gameSceneRef.current.restart(
        'cosmic_math_dimension',
        'mixed',
        5,
        9999,
        22,
        true
      );
      gameSceneRef.current.isPaused = false;
    }

    sound.startMusic();
  };

  // Player input actions
  const handleMoveLeft = useCallback(() => {
    if (gameSceneRef.current && status === 'playing') {
      gameSceneRef.current.changeLane('left');
    }
  }, [status]);

  const handleMoveRight = useCallback(() => {
    if (gameSceneRef.current && status === 'playing') {
      gameSceneRef.current.changeLane('right');
    }
  }, [status]);

  const handleJump = useCallback(() => {
    if (gameSceneRef.current && status === 'playing') {
      gameSceneRef.current.jump();
    }
  }, [status]);

  const handleSlide = useCallback(() => {
    if (gameSceneRef.current && status === 'playing') {
      gameSceneRef.current.slide();
    }
  }, [status]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'playing') {
        if (e.key === 'Escape' && status === 'paused') {
          handleResume();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          // In RTL or natural arrow direction:
          // Left arrow moves to left lane
          handleMoveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleMoveRight();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          e.preventDefault();
          handleJump();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleSlide();
          break;
        case 'Escape':
        case 'p':
        case 'P':
          handlePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, handleMoveLeft, handleMoveRight, handleJump, handleSlide]);

  const handlePause = () => {
    if (gameSceneRef.current) {
      gameSceneRef.current.isPaused = true;
    }
    sound.stopMusic();
    setStatus('paused');
  };

  const handleResume = () => {
    if (gameSceneRef.current) {
      gameSceneRef.current.isPaused = false;
    }
    sound.startMusic();
    setStatus('playing');
  };

  const handleToggleMute = () => {
    setProgress(prev => {
      const next = !prev.audioEnabled;
      return { ...prev, audioEnabled: next };
    });
  };

  const handleQualityChange = (q: 'high' | 'medium' | 'low') => {
    setProgress(prev => ({ ...prev, graphicsQuality: q }));
    if (gameSceneRef.current) {
      gameSceneRef.current.setQuality(q);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div 
        ref={canvasMountRef} 
        className="absolute inset-0 w-full h-full z-0 cursor-pointer"
        tabIndex={0}
      />

      {/* Main Title Menu */}
      {status === 'menu' && (
        <MainMenu
          progress={progress}
          onStartCampaign={() => handleStartCampaign()}
          onStartEndless={handleStartEndless}
          onOpenCharacters={() => setStatus('characters')}
          onOpenLevels={() => setStatus('levels')}
          onOpenShop={() => setStatus('shop')}
          onOpenStats={() => setStatus('stats')}
          onOpenDailyReward={() => setShowDailyReward(true)}
          hasUnclaimedDailyReward={!progress.hasClaimedDailyToday}
          isMuted={!progress.audioEnabled}
          onToggleMute={handleToggleMute}
          controlsMode={progress.controlsMode}
          onToggleControls={() => {
            setProgress(prev => {
              const modes: ('swipe' | 'buttons' | 'both')[] = ['swipe', 'buttons', 'both'];
              const nextIdx = (modes.indexOf(prev.controlsMode) + 1) % modes.length;
              return { ...prev, controlsMode: modes[nextIdx] };
            });
          }}
        />
      )}

      {/* In-Game Heads Up Display */}
      {status === 'playing' && (
        <>
          <HUD
            score={score}
            distance={distance}
            coins={coinsRun}
            gems={gemsRun}
            lives={lives}
            maxLives={3}
            currentLevelNumber={currentLevel.levelNumber}
            questionsAnswered={questionsAnswered}
            targetQuestions={currentLevel.questionsCount}
            isEndless={isEndless}
            activePowerups={activePowerups}
            isMuted={!progress.audioEnabled}
            onToggleMute={handleToggleMute}
            onPause={handlePause}
          />

          {/* Upcoming Math Gate Banner */}
          <MathGateBanner
            question={upcomingQuestion}
            currentLane={currentLane}
          />

          {/* Mobile Touch / Virtual Buttons */}
          <TouchControls
            onLeft={handleMoveLeft}
            onRight={handleMoveRight}
            onJump={handleJump}
            onSlide={handleSlide}
            showButtons={progress.controlsMode === 'buttons' || progress.controlsMode === 'both'}
          />
        </>
      )}

      {/* Pause Menu Modal */}
      {status === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onRestart={() => isEndless ? handleStartEndless() : handleStartCampaign()}
          onHome={() => setStatus('menu')}
          isMuted={!progress.audioEnabled}
          onToggleMute={handleToggleMute}
          musicVolume={progress.musicVolume}
          sfxVolume={progress.sfxVolume}
          onMusicVolumeChange={val => setProgress(prev => ({ ...prev, musicVolume: val }))}
          onSfxVolumeChange={val => setProgress(prev => ({ ...prev, sfxVolume: val }))}
          voiceTts={progress.voiceTtsEnabled}
          onToggleVoiceTts={() => setProgress(prev => ({ ...prev, voiceTtsEnabled: !prev.voiceTtsEnabled }))}
          quality={progress.graphicsQuality}
          onQualityChange={handleQualityChange}
        />
      )}

      {/* Game Over Modal */}
      {status === 'gameover' && (
        <GameOverModal
          score={score}
          distance={distance}
          coinsEarned={coinsRun}
          reason={gameOverReason}
          mathHistory={mathHistory}
          onRetry={() => isEndless ? handleStartEndless() : handleStartCampaign()}
          onHome={() => setStatus('menu')}
        />
      )}

      {/* Victory Celebration Modal */}
      {status === 'victory' && (
        <VictoryModal
          levelNumber={currentLevel.levelNumber}
          score={score}
          coinsEarned={coinsRun + 100}
          gemsEarned={gemsRun + 2}
          accuracy={victoryStats.accuracy}
          stars={victoryStats.stars}
          onNextLevel={() => {
            const nextLvlIndex = Math.min(levels.length - 1, currentLevel.levelNumber);
            handleStartCampaign(levels[nextLvlIndex]);
          }}
          onReplay={() => handleStartCampaign()}
          onHome={() => setStatus('menu')}
        />
      )}

      {/* 100-Level Selector */}
      {status === 'levels' && (
        <LevelSelectModal
          levels={levels}
          currentHighestUnlocked={progress.highestLevelUnlocked}
          onSelectLevel={lvl => handleStartCampaign(lvl)}
          onClose={() => setStatus('menu')}
        />
      )}

      {/* Character Customization & Powerup Shop */}
      {status === 'shop' && (
        <ShopModal
          progress={progress}
          onUpdateProgress={updater => setProgress(updater)}
          onClose={() => setStatus('menu')}
        />
      )}

      {/* 3D Realistic Character Selection & Purchasing Modal */}
      {status === 'characters' && (
        <CharacterSelectModal
          progress={progress}
          characters={GAME_CHARACTERS}
          onSelectCharacter={(charId) => {
            setProgress(prev => ({ ...prev, equippedSkin: charId }));
          }}
          onBuyCharacter={(char) => {
            if (progress.coins >= char.price) {
              sound.playPowerup();
              setProgress(prev => ({
                ...prev,
                coins: prev.coins - char.price,
                unlockedSkins: [...prev.unlockedSkins, char.id],
                equippedSkin: char.id
              }));
            } else {
              sound.playWrongAnswer();
            }
          }}
          onClose={() => setStatus('menu')}
        />
      )}

      {/* Mathematical Accuracy Statistics */}
      {status === 'stats' && (
        <StatsModal
          progress={progress}
          onClose={() => setStatus('menu')}
        />
      )}

      {/* Daily Login Reward Popup Modal */}
      {showDailyReward && (
        <DailyRewardModal
          consecutiveDays={progress.consecutiveLoginDays || 1}
          hasClaimedToday={!!progress.hasClaimedDailyToday}
          onClaim={handleClaimDailyReward}
          onClose={() => setShowDailyReward(false)}
        />
      )}
    </div>
  );
}
