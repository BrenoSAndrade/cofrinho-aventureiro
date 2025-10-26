import { GameCanvas } from '@/components/GameCanvas';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-game-sky to-background flex flex-col">
      <header className="py-6 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary text-shadow-sm animate-bounce-in">
          🪙 Cofre Aventureiro 🪙
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Aprenda sobre dinheiro enquanto se diverte!
        </p>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-5xl">
          <GameCanvas />
        </div>
      </main>
      
      <footer className="py-4 px-4 text-center text-sm text-muted-foreground">
        <p>Projeto de Extensão — Ensino de Educação Financeira</p>
        <p className="mt-1">Para crianças de 7 a 12 anos</p>
      </footer>
    </div>
  );
};

export default Index;
