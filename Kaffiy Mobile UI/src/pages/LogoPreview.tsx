import { KaffiyLogo, KaffiyLogoText } from "@/components/KaffiyLogo";

const LogoPreview = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard mockup */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Logo in top left */}
          <div className="p-5 border-b border-gray-100">
            <KaffiyLogoText size="lg" showAccent />
          </div>
          
          {/* Nav items mockup */}
          <nav className="flex-1 p-4 space-y-1">
            {["Dashboard", "Cafes", "Customers", "Campaigns", "Analytics", "Settings"].map((item, i) => (
              <div 
                key={item}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                  i === 0 
                    ? "bg-amber-50 text-amber-700" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item}
              </div>
            ))}
          </nav>
          
          {/* User section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-medium text-sm">
                K
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Kaffiy Admin</div>
                <div className="text-xs text-gray-500">admin@kaffiy.com</div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-8 overflow-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Kaffiy Logo Showcase</h1>
          
          {/* Logo variations */}
          <div className="grid gap-8">
            {/* Text Logo */}
            <section className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Text Logo (Recommended)
              </h2>
              <div className="flex items-end gap-8">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Small</span>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <KaffiyLogoText size="sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Medium</span>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <KaffiyLogoText size="md" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Large</span>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <KaffiyLogoText size="lg" />
                  </div>
                </div>
              </div>
            </section>
            
            {/* Accent variations */}
            <section className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Accent Variations
              </h2>
              <div className="flex items-center gap-12">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">With copper accent dot</span>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <KaffiyLogoText size="lg" showAccent />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Monochrome</span>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <KaffiyLogoText size="lg" showAccent={false} />
                  </div>
                </div>
              </div>
            </section>
            
            {/* Dark background */}
            <section className="bg-slate-900 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                On Dark Background
              </h2>
              <div className="p-4 inline-block">
                <span 
                  className="font-bold text-3xl tracking-tight"
                  style={{ 
                    color: '#FFFFFF',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    letterSpacing: '-0.03em'
                  }}
                >
                  kaff
                  <span className="relative">
                    i
                    <span 
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: '#D97706' }}
                    />
                  </span>
                  y
                </span>
              </div>
            </section>

            {/* Color specs */}
            <section className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Brand Colors
              </h2>
              <div className="flex gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: '#1E293B' }} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Charcoal</div>
                    <div className="text-xs text-gray-500 font-mono">#1E293B</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: '#D97706' }} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Copper Accent</div>
                    <div className="text-xs text-gray-500 font-mono">#D97706</div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LogoPreview;
