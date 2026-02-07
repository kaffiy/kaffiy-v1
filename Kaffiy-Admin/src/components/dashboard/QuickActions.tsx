import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, QrCode, TrendingUp, Maximize2 } from "lucide-react";
import { NewCampaignModal } from "./NewCampaignModal";
import { QRVerificationModal } from "./QRVerificationModal";
import { LoyaltyDonut } from "./LoyaltyDonut";
import { DailyVisitsChart } from "./DailyVisitsChart";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, ComposedChart, Bar, Tooltip as RechartsTooltip } from "recharts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardDateRange } from "@/contexts/DashboardDateRangeContext";

type ChartModalType = "donut" | "distribution" | null;

type PeriodType = "daily" | "weekly" | "monthly";

const chartPeriodData: Record<PeriodType, Array<{ time: string; visits: number; current: number }>> = {
  daily: [
    { time: "8 AM", visits: 3, current: 0 },
    { time: "10 AM", visits: 6, current: 0 },
    { time: "12 PM", visits: 8, current: 0 },
    { time: "2 PM", visits: 11, current: 0 },
    { time: "4 PM", visits: 9, current: 0 },
    { time: "6 PM", visits: 5, current: 0 },
    { time: "Şu an", visits: 0, current: 3 },
  ],
  weekly: [
    { time: "Pzt", visits: 42, current: 0 },
    { time: "Sal", visits: 38, current: 0 },
    { time: "Çar", visits: 45, current: 0 },
    { time: "Per", visits: 52, current: 0 },
    { time: "Cum", visits: 48, current: 0 },
    { time: "Cmt", visits: 55, current: 0 },
    { time: "Paz", visits: 32, current: 0 },
  ],
  monthly: [
    { time: "1.H", visits: 280, current: 0 },
    { time: "2.H", visits: 320, current: 0 },
    { time: "3.H", visits: 290, current: 0 },
    { time: "4.H", visits: 358, current: 0 },
  ]
};

// Action Buttons Component (QR Oku, Kampanya ekle)
export const QuickActionButtons = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl h-11 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Kampanya
        </Button>
        
        <Button 
          onClick={() => setIsQRModalOpen(true)}
          variant="outline"
          className="gap-2 rounded-xl h-11 text-sm font-medium border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
        >
          <QrCode className="w-4 h-4" />
          QR Oku
        </Button>
      </div>
      
      <NewCampaignModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <QRVerificationModal open={isQRModalOpen} onOpenChange={setIsQRModalOpen} />
    </>
  );
};

// Analytics Card Component (Collapsible)
export const AnalyticsCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedChart, setExpandedChart] = useState<ChartModalType>(null);
  const [period, setPeriod] = useState<PeriodType>("daily");
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number; value: number; time: string } | null>(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { isCustomRange, rangeDays, preset } = useDashboardDateRange();

  useEffect(() => {
    if (preset === "daily" || preset === "weekly" || preset === "monthly") {
      setPeriod(preset);
    }
  }, [preset]);

  const scaleValue = (value: number) => Math.round(value * rangeDays);
  const returningPercentage = 70;
  const newPercentage = 30;

  const customChartData = chartPeriodData.daily.map((item) => ({
    ...item,
    visits: scaleValue(item.visits),
    current: scaleValue(item.current),
  }));

  const chartData = isCustomRange ? customChartData : chartPeriodData[period];
  const totalVisits = chartData.reduce((sum, d) => sum + d.visits, 0);

  const donutData = [
    { name: "Geri Dönen", value: returningPercentage, color: "hsl(72 22% 38%)" },
    { name: "Yeni", value: newPercentage, color: "hsl(42 55% 55%)" },
  ];

  const distributionTitle = isCustomRange
    ? "Özel Aralık"
    : period === "daily"
    ? "Günlük"
    : period === "weekly"
    ? "Haftalık"
    : "Aylık";

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-gradient-to-br from-sage/10 via-sage/5 to-transparent rounded-2xl border border-sage/20 overflow-hidden">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-sage/5 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sage/20 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-sage" />
                </div>
                <span className="text-sm font-semibold text-foreground">Analizler</span>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Donut Chart */}
                <div 
                  className="bg-background/60 rounded-xl p-3 cursor-pointer group hover:bg-background/80 transition-colors relative"
                  onClick={() => setExpandedChart("donut")}
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <LoyaltyDonut
                    period={period}
                    customData={
                      isCustomRange
                        ? { returning: returningPercentage, new: newPercentage }
                        : undefined
                    }
                  />
                </div>
                
                {/* Daily Distribution Chart */}
                <div 
                  className="bg-background/60 rounded-xl p-3 cursor-pointer group hover:bg-background/80 transition-colors relative"
                  onClick={() => setExpandedChart("distribution")}
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <DailyVisitsChart
                    period={period}
                    customData={
                      isCustomRange
                        ? { label: "Özel Aralık", data: chartData }
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Donut Chart Modal */}
      <Dialog open={expandedChart === "donut"} onOpenChange={(open) => !open && setExpandedChart(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Geri Dönen vs Yeni Müşteriler - Detaylı Analiz</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Toplam Müşteri</p>
                <p className="text-2xl font-bold text-foreground">{totalVisits}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Geri Dönen</p>
                <p className="text-2xl font-bold text-foreground">{returningPercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">{Math.round(totalVisits * returningPercentage / 100)} müşteri</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Yeni</p>
                <p className="text-2xl font-bold text-foreground">{newPercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">{Math.round(totalVisits * newPercentage / 100)} müşteri</p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend & Details */}
            <div className="flex justify-center gap-8 pt-4 border-t border-border">
              {donutData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <span className="text-sm font-medium text-foreground">{item.name} Müşteriler</span>
                    <p className="text-xs text-muted-foreground">
                      {item.value}% • {Math.round(totalVisits * item.value / 100)} kişi
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs font-medium text-primary mb-2">İçgörü</p>
              <p className="text-sm text-muted-foreground">
                {returningPercentage > newPercentage 
                  ? `Geri dönen müşterileriniz toplam ziyaretlerin ${returningPercentage}%'ini oluşturuyor. Bu, güçlü bir müşteri sadakati göstergesidir.`
                  : `Yeni müşteri oranınız ${newPercentage}% ile oldukça yüksek. Büyüme potansiyeliniz yüksek görünüyor.`
                }
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Distribution Chart Modal */}
      <Dialog open={expandedChart === "distribution"} onOpenChange={(open) => {
        if (!open) {
          setExpandedChart(null);
          setHoverPosition(null);
          setSelectedPointIndex(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{distributionTitle} Dağılım - Detaylı Analiz</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Toplam Ziyaret</p>
                <p className="text-2xl font-bold text-foreground">{chartData.reduce((sum, d) => sum + d.visits, 0)}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">En Yoğun Zaman</p>
                <p className="text-lg font-bold text-foreground">
                  {hoverPosition 
                    ? hoverPosition.time
                    : selectedPointIndex !== null && chartData[selectedPointIndex]
                    ? chartData[selectedPointIndex].time
                    : chartData.find(d => d.visits === Math.max(...chartData.map(d => d.visits)))?.time || chartData[0]?.time}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {hoverPosition 
                    ? hoverPosition.value
                    : selectedPointIndex !== null && chartData[selectedPointIndex]
                    ? chartData[selectedPointIndex].visits
                    : Math.max(...chartData.map(d => d.visits))} ziyaret
                </p>
              </div>
            </div>

            {/* Chart */}
            <div 
              ref={chartContainerRef}
              className="h-80 relative mb-16"
              onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate which data point we're closest to based on X position
                const chartWidth = rect.width - 60; // Account for margins
                const relativeX = Math.max(0, Math.min(chartWidth, x - 30)); // Account for left margin
                const pointRatio = relativeX / chartWidth;
                const pointIndex = Math.round(pointRatio * (chartData.length - 1));
                const clampedIndex = Math.max(0, Math.min(chartData.length - 1, pointIndex));
                
                // Interpolate between points for smooth cursor movement
                const exactIndex = pointRatio * (chartData.length - 1);
                const lowerIndex = Math.floor(exactIndex);
                const upperIndex = Math.min(chartData.length - 1, Math.ceil(exactIndex));
                const t = exactIndex - lowerIndex;
                
                let interpolatedValue = chartData[clampedIndex].visits;
                let interpolatedTime = chartData[clampedIndex].time;
                
                if (lowerIndex !== upperIndex && t > 0) {
                  const lowerValue = chartData[lowerIndex].visits;
                  const upperValue = chartData[upperIndex].visits;
                  interpolatedValue = lowerValue + (upperValue - lowerValue) * t;
                  interpolatedTime = chartData[clampedIndex].time;
                }
                
                // Calculate Y position based on value
                const maxValue = Math.max(...chartData.map(d => d.visits));
                const minValue = 0;
                const chartHeight = rect.height - 80; // Account for margins
                const normalizedValue = (interpolatedValue - minValue) / (maxValue - minValue);
                const calculatedY = rect.height - 40 - (normalizedValue * chartHeight); // Bottom margin = 40
                
                setHoverPosition({
                  x: Math.max(30, Math.min(rect.width - 30, x)),
                  y: calculatedY,
                  value: Math.round(interpolatedValue),
                  time: interpolatedTime,
                });
                
                setSelectedPointIndex(clampedIndex);
              }}
              onMouseLeave={() => {
                setHoverPosition(null);
                const maxIndex = chartData.findIndex(d => d.visits === Math.max(...chartData.map(d => d.visits)));
                setSelectedPointIndex(maxIndex >= 0 ? maxIndex : 0);
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <defs>
                    <linearGradient id={`dailyVisitGradientModal-${period}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(72, 22%, 38%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(72, 22%, 38%)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <RechartsTooltip
                    content={() => null}
                    cursor={false}
                  />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(25, 12%, 55%)' }}
                    interval={0}
                    dy={5}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(25, 12%, 55%)' }}
                    domain={[0, 'dataMax']}
                  />
                  <Area 
                    type="monotone"
                    dataKey="visits"
                    stroke="hsl(72, 22%, 38%)"
                    strokeWidth={2}
                    fill={`url(#dailyVisitGradientModal-${period})`}
                    dot={(props: any) => {
                      const { cx, cy } = props;
                      if (cx && cy) {
                        return (
                          <circle 
                            key={`dot-${props.index}`}
                            cx={cx} 
                            cy={cy} 
                            r={4}
                            fill="hsl(72, 22%, 38%)"
                            stroke="white" 
                            strokeWidth={1.5}
                          />
                        );
                      }
                      return null;
                    }}
                    activeDot={false}
                  />
                  <Bar 
                    dataKey="current"
                    fill="hsl(35, 30%, 55%)"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              
              {/* Hover indicator line and dot */}
              {hoverPosition && (
                <>
                  <div 
                    className="absolute w-0.5 bg-primary pointer-events-none z-20"
                    style={{
                      left: `${hoverPosition.x}px`,
                      top: 20,
                      bottom: 40,
                    }}
                  />
                  <div 
                    className="absolute w-3 h-3 bg-primary rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
                    style={{
                      left: `${hoverPosition.x}px`,
                      top: `${hoverPosition.y}px`,
                    }}
                  />
                </>
              )}
              
              {/* Data display box */}
              {hoverPosition && (
                <div 
                  className="absolute bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg text-xs pointer-events-none z-40"
                  style={{
                    left: `${Math.min(hoverPosition.x + 10, chartContainerRef.current ? chartContainerRef.current.offsetWidth - 120 : hoverPosition.x)}px`,
                    top: `${Math.max(10, hoverPosition.y - 40)}px`,
                  }}
                >
                  <div className="font-semibold text-foreground">{hoverPosition.time}</div>
                  <div className="text-muted-foreground">{hoverPosition.value} ziyaret</div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3 rounded-sm shadow-sm" style={{ backgroundColor: "hsl(72, 22%, 38%)" }} />
                <span className="text-[11px] font-medium text-muted-foreground tracking-wide">Ziyaretler</span>
              </div>
              <div className="w-px h-4 bg-border/40" />
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3 rounded-sm shadow-sm" style={{ backgroundColor: "hsl(35, 30%, 55%)" }} />
                <span className="text-[11px] font-medium text-muted-foreground tracking-wide">Şu an</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const QuickActions = () => {
  return (
    <div className="space-y-3">
      <AnalyticsCard />
      <QuickActionButtons />
    </div>
  );
};
