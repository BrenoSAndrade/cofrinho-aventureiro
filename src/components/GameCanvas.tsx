import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from '@/game/scenes/BootScene';
import { MenuScene } from '@/game/scenes/MenuScene';
import { PreTutorialScene } from '@/game/scenes/PreTutorialScene';
import { TutorialScene } from '@/game/scenes/TutorialScene';
import { Level1Scene } from '@/game/scenes/Level1Scene';
import { Level2Scene } from '@/game/scenes/Level2Scene';
import { Level3Scene } from '@/game/scenes/Level3Scene';
import { HUDScene } from '@/game/scenes/HUDScene';

export const GameCanvas = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 450,
      parent: containerRef.current,
      backgroundColor: '#87CEEB',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 600, x: 0 },
          debug: false,
        },
      },
      scene: [BootScene, MenuScene, PreTutorialScene, TutorialScene, Level1Scene, Level2Scene, Level3Scene, HUDScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        pixelArt: true,
        antialias: false,
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-game-sky to-background">
      <div 
        ref={containerRef} 
        className="rounded-lg overflow-hidden shadow-2xl border-4 border-primary"
        style={{ maxWidth: '800px', maxHeight: '450px' }}
      />
    </div>
  );
};
