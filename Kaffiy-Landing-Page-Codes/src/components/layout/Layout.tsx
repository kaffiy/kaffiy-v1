import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div 
      className="min-h-screen flex flex-col relative bg-[#F8FAFC] dark:bg-slate-950 overflow-x-hidden"
      style={{ transition: 'background 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      {/* Subtle theme-colored radial gradients */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-100 dark:opacity-60"
        style={{
          background: `radial-gradient(ellipse at 20% 30%, hsl(var(--primary) / 0.08) 0%, transparent 50%)`,
          filter: 'blur(120px)',
          transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-100 dark:opacity-50"
        style={{
          background: `radial-gradient(ellipse at 80% 70%, hsl(var(--primary) / 0.06) 0%, transparent 50%)`,
          filter: 'blur(100px)',
          transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      <Navbar />
      <main 
        className="flex-1 pt-16 relative"
        style={{
          background: 'transparent',
          transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 2,
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
