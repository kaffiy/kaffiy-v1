import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Search, ChevronDown, ChevronUp, Loader2, UserPlus, X, MapPin, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScrapedLead {
  ID?: string;
  "Company Name"?: string;
  City?: string;
  Website?: string;
  Phone?: string;
  Mail?: string;
  "Last Review"?: string;
  "Lead Type"?: string;
  _scraped_at?: string;
  AddedToLeadsAs?: string;
  isWebsiteFixCandidate?: boolean;
}

function hasOwnWebsite(lead: ScrapedLead): boolean {
  const w = (lead.Website || "").trim();
  return !!w && !w.includes("google.com/maps");
}

interface ScraperStatus {
  status: string;
  details: string;
  run_id?: string;
  updated_at?: string;
}

const DEFAULT_SEARCH_STRINGS = "kafe, kahve, coffee, cafe, espresso, roastery";

interface ScraperSectionProps {
  onLeadsAdded?: () => void;
}

export function ScraperSection({ onLeadsAdded }: ScraperSectionProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [county, setCounty] = useState("Kadıköy");
  const [searchStrings, setSearchStrings] = useState(DEFAULT_SEARCH_STRINGS);
  const [useApifyMode, setUseApifyMode] = useState(true);
  const [usePlaces, setUsePlaces] = useState(true);
  const [maxResults, setMaxResults] = useState(100);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<ScraperStatus | null>(null);
  const [scrapedLeads, setScrapedLeads] = useState<ScrapedLead[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/scraper-status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(null);
    }
  }, []);

  const fetchScrapedLeads = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/scraped-leads");
      const data = await res.json();
      setScrapedLeads(Array.isArray(data) ? data : []);
    } catch {
      setScrapedLeads([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchStatus();
      fetchScrapedLeads();
    }
  }, [open, fetchStatus, fetchScrapedLeads]);

  const handleRun = async () => {
    const useApify = useApifyMode && searchStrings.trim();
    if (!useApify && !query.trim()) {
      toast({ title: "Sorgu veya arama terimleri girin", variant: "destructive" });
      return;
    }
    setRunning(true);
    try {
      const res = await fetch("/api/run-scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          city: city.trim() || "İstanbul",
          county: county.trim(),
          searchStrings: useApify ? searchStrings.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
          maxResults: Math.min(100, Math.max(1, maxResults)),
          usePlaces: usePlaces,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "Arama tamamlandı", description: data.details });
        await fetchStatus();
        await fetchScrapedLeads();
      } else {
        toast({ title: "Arama hatası", description: data.error || "Bilinmeyen hata", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "İstek hatası", description: String(e), variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const handleMarkWebsiteFix = async (ids: string[]) => {
    try {
      const res = await fetch("/api/scraped-leads/mark-website-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "Web sitesi düzelt olarak işaretlendi", description: `${data.marked ?? ids.length} adet.` });
        await fetchScrapedLeads(true);
      } else {
        toast({ title: "İşaretlenemedi", description: data.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Hata", description: String(e), variant: "destructive" });
    }
  };

  const handleUnmarkWebsiteFix = async (ids: string[]) => {
    try {
      const res = await fetch("/api/scraped-leads/unmark-website-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "İşaret geri alındı", description: `${data.unmarked ?? ids.length} adet.` });
        await fetchScrapedLeads(true);
      } else {
        toast({ title: "Geri alınamadı", description: data.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Hata", description: String(e), variant: "destructive" });
    }
  };

  const handleAddToLeads = async (ids: string[]) => {
    try {
      const res = await fetch("/api/scraped-leads/add-selected-to-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "Lead'lere eklendi", description: `${data.added} adet eklendi.` });
        await fetchScrapedLeads(true);
        if (onLeadsAdded) {
          onLeadsAdded();
        }
      } else {
        toast({ title: "Eklenemedi", description: data.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Hata", description: String(e), variant: "destructive" });
    }
  };

  const handleReject = async (ids: string[]) => {
    try {
      const res = await fetch("/api/scraped-leads/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "Listeden çıkarıldı", description: `${data.removed} adet.` });
        await fetchScrapedLeads(true);
      } else {
        toast({ title: "Hata", description: data.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Hata", description: String(e), variant: "destructive" });
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-5">
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Search className="h-5 w-5" />
              Scraper (Google Lead Arama)
            </CardTitle>
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="scraper-apify-mode"
                    checked={useApifyMode}
                    onChange={(e) => setUseApifyMode(e.target.checked)}
                    className="rounded border-input"
                  />
                  <Label htmlFor="scraper-apify-mode" className="cursor-pointer">Apify benzeri (çoklu terim + konum)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="scraper-places"
                    checked={usePlaces}
                    onChange={(e) => setUsePlaces(e.target.checked)}
                    className="rounded border-input"
                  />
                  <Label htmlFor="scraper-places" className="cursor-pointer">Google Places API (kafe in Kadıköy)</Label>
                </div>
              </div>
              {useApifyMode ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <Label htmlFor="scraper-search-strings">Arama terimleri (virgülle)</Label>
                    <Input
                      id="scraper-search-strings"
                      placeholder="kafe, kahve, coffee, cafe, espresso, roastery"
                      value={searchStrings}
                      onChange={(e) => setSearchStrings(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scraper-county">İlçe / Konum</Label>
                    <Input
                      id="scraper-county"
                      placeholder="Kadıköy"
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scraper-city">Şehir</Label>
                    <Input
                      id="scraper-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <Label htmlFor="scraper-query">Tek arama sorgusu</Label>
                    <Input
                      id="scraper-query"
                      placeholder="örn: kafe kadıköy, kahveci istanbul"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scraper-city-single">Şehir</Label>
                    <Input
                      id="scraper-city-single"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <div className="flex items-center justify-between">
                  <Label htmlFor="scraper-max">Max sonuç</Label>
                  <span className="text-sm font-medium tabular-nums text-muted-foreground">{maxResults}</span>
                </div>
                <Slider
                  id="scraper-max"
                  min={1}
                  max={100}
                  step={1}
                  value={[maxResults]}
                  onValueChange={([v]) => setMaxResults(v)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleRun} disabled={running} size="sm">
                {running ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Arama Başlat
              </Button>
              <Button variant="outline" size="sm" onClick={() => { fetchStatus(); fetchScrapedLeads(true); }}>
                Yenile
              </Button>
              {status && (
                <Badge variant={status.status === "running" ? "default" : status.status === "error" ? "destructive" : "secondary"}>
                  {status.status}: {status.details || "-"}
                </Badge>
              )}
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Yükleniyor...</p>
            ) : scrapedLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz scraped lead yok. Arama yapın veya sonuçları temizleyin.</p>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 font-medium">İşletme</th>
                      <th className="text-left p-2 font-medium">Şehir</th>
                      <th className="text-left p-2 font-medium">Web / İletişim</th>
                      <th className="text-left p-2 font-medium">Önizleme</th>
                      <th className="text-center p-2 font-medium">Harita</th>
                      <th className="text-center p-2 font-medium">Web site fix</th>
                      <th className="text-right p-2 font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scrapedLeads.map((lead) => {
                      const isMarkedWebsiteFix = Boolean(lead.isWebsiteFixCandidate);
                      const isOwnWebsite = hasOwnWebsite(lead);
                      const rowClass = isMarkedWebsiteFix
                        ? "border-b last:border-0 bg-green-500/10 dark:bg-green-950/20 border-l-4 border-l-green-400/50 dark:border-l-green-600/40"
                        : isOwnWebsite
                          ? "border-b last:border-0 bg-orange-500/15 dark:bg-orange-950/25 border-l-4 border-l-orange-500"
                          : "border-b last:border-0";
                      return (
                        <tr key={lead.ID} className={rowClass}>
                          <td className="p-2 font-medium">
                            <span>{lead["Company Name"] || "-"}</span>
                            {isOwnWebsite && !isMarkedWebsiteFix && (
                              <span className="ml-1.5 inline-block rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-medium text-orange-800 dark:text-orange-200" title="Kendi web sitesi var (Google Maps değil)">
                                Kendi sitesi
                              </span>
                            )}
                            {isMarkedWebsiteFix && (
                              <span className="ml-1.5 inline-block rounded bg-green-500/15 px-1.5 py-0.5 text-[10px] font-medium text-green-800 dark:text-green-300 opacity-90" title="Web sitesi düzelt olarak işaretlendi">
                                Web fix
                              </span>
                            )}
                          </td>
                          <td className="p-2">{lead.City || "-"}</td>
                          <td className="p-2">
                            <div className="flex flex-col gap-0.5">
                              {lead.Website && (
                                <a href={lead.Website} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate max-w-[200px]">
                                  {lead.Website}
                                </a>
                              )}
                              {lead.Phone && <span>{lead.Phone}</span>}
                              {lead.Mail && <span className="text-muted-foreground">{lead.Mail}</span>}
                              {!lead.Website && !lead.Phone && !lead.Mail && "-"}
                            </div>
                          </td>
                          <td className="p-2 max-w-[220px] truncate text-muted-foreground" title={lead["Last Review"]}>
                            {lead["Last Review"] || "-"}
                          </td>
                          <td className="p-2 text-center">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([lead["Company Name"], lead.City].filter(Boolean).join(" "))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="Google Maps'te aç"
                            >
                              <MapPin className="h-4 w-4" />
                            </a>
                          </td>
                          <td className="p-2 text-center">
                            {isMarkedWebsiteFix ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-green-700 dark:text-green-400 border-green-300 dark:border-green-600"
                                onClick={() => lead.ID && handleUnmarkWebsiteFix([lead.ID])}
                                title="İşareti geri al"
                              >
                                İşareti geri al
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8"
                                onClick={() => lead.ID && handleMarkWebsiteFix([lead.ID])}
                                title="Sadece işaretle; lead'e eklemek için Ekle kullanın"
                              >
                                <Wrench className="h-3.5 w-3 mr-1" />
                                Web sitesi düzelt
                              </Button>
                            )}
                          </td>
                          <td className="p-2 text-right">
                            <div className="flex flex-wrap justify-end gap-1">
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8"
                                onClick={() => lead.ID && handleAddToLeads([lead.ID])}
                              >
                                <UserPlus className="h-3.5 w-3 mr-1" />
                                Ekle
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() => lead.ID && handleReject([lead.ID])}
                              >
                                <X className="h-3.5 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {scrapedLeads.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleAddToLeads(scrapedLeads.map((l) => l.ID).filter(Boolean) as string[])}
                >
                  <UserPlus className="h-3.5 w-3 mr-1" />
                  Tümünü Lead&apos;lere Ekle
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAddToLeads(scrapedLeads.filter((l) => l.isWebsiteFixCandidate).map((l) => l.ID).filter(Boolean) as string[])}
                  disabled={!scrapedLeads.some((l) => l.isWebsiteFixCandidate)}
                  title="Web sitesi düzelt olarak işaretlenenleri lead'lere ekle"
                >
                  <Wrench className="h-3.5 w-3 mr-1" />
                  Markalıları Lead&apos;lere Ekle
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkWebsiteFix(scrapedLeads.map((l) => l.ID).filter(Boolean) as string[])}
                  title="Tümünü sadece işaretle (lead'e ekleme)"
                >
                  <Wrench className="h-3.5 w-3 mr-1" />
                  Tümünü Web sitesi düzelt olarak işaretle
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(scrapedLeads.map((l) => l.ID).filter(Boolean) as string[])}
                >
                  Tümünü Reddet
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
