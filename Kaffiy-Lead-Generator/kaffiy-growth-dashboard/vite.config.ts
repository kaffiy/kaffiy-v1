import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "node:fs/promises";
import { spawn, execSync } from "node:child_process";
import { platform } from "node:os";

// https://vitejs.dev/config/
const loadEnvFile = async (filePath: string) => {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const env: Record<string, string> = {};
    for (const line of content.split(/\r?\n/)) {
      if (!line || line.trim().startsWith("#")) continue;
      const [key, ...rest] = line.split("=");
      if (!key) continue;
      env[key.trim()] = rest.join("=").trim();
    }
    return env;
  } catch {
    return {};
  }
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  return ({
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      {
        name: "leads-data-writer",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.method === "POST" && req.url?.startsWith("/api/regenerate_message")) {
              let body = "";
              req.on("data", (chunk) => {
                body += chunk;
              });

              req.on("end", async () => {
                try {
                  const parsed = JSON.parse(body);
                  const cafeName = parsed.cafeName || "Kafe";
                  const city = parsed.city || "İstanbul";
                  const review = parsed.review || "";
                  const strategy = parsed.strategy || "A";
                  const leadId = parsed.leadId;
                  const phone = parsed.phone;
                  const leadsPath = path.resolve(__dirname, "src/data/leads_data.json");
                  let leads: Array<Record<string, string>> = [];
                  let leadIndex = -1;
                  try {
                    const raw = await fs.readFile(leadsPath, "utf-8");
                    leads = JSON.parse(raw);
                    if (Array.isArray(leads)) {
                      leadIndex = leads.findIndex((lead) => {
                        if (leadId && String(lead.ID) === String(leadId)) {
                          return true;
                        }
                        if (phone) {
                          return String(lead.Phone || "") === String(phone);
                        }
                        return false;
                      });
                    } else {
                      leads = [];
                    }
                  } catch {
                    leads = [];
                  }
                  const botEnv = await loadEnvFile(path.resolve(__dirname, "..", "..", "kaffiy_bot", ".env"));
                  const apiKey = env.OPENAI_API_KEY || botEnv.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

                  if (!apiKey) {
                    res.statusCode = 500;
                    res.end("Missing OPENAI_API_KEY (set in kaffiy-growth-hub-main/.env)");
                    return;
                  }

                  const STRATEGIES: Record<string, { name: string; description: string; template: string }> = {
                    A: {
                      name: "The Visionary (Tech-First)",
                      description: "Tech İstanbul bünyesinde, butik kafelerin büyük zincirlerin veri gücüyle rekabet etmesini sağlayan Akıllı Ara Katman (Economic Middleware); 10 öncü işletmeyle pilot program.",
                      template: "Merhabalar, kolay gelsin :) Tech İstanbul bünyesinde, butik kafelerin büyük zincirlerin veri gücüyle rekabet etmesini sağlayan bir 'Akıllı Ara Katman' (Economic Middleware) geliştirdik. Şu an sistemin tüketici alışkanlığı tahminleme algoritmasını test edecek 10 öncü işletme seçiyoruz. Müşteri yorumlarınızı çok olumlu bulduk. Sizin vizyoner bakış açınızla bu pilot programda yer alıp sistemimizi yorumlamanızı çok isteriz. Kısaca bahsetmemi ister misiniz?"
                    },
                    B: {
                      name: "The Neighbor (Community & Ecosystem)",
                      description: "Tech İstanbul çatısı altında yerel esnafın birbirine akıllıca müşteri yönlendirdiği dayanışma ağı; İstanbul'da pilot grup.",
                      template: "Merhabalar, kolay gelsin :) Ben de mahallenin bir girişimcisiyim. Tech İstanbul çatısı altında, yerel esnafın birbirine akıllıca müşteri yönlendirdiği bir dayanışma ağı kuruyoruz. Bu 'Akıllı Ara Taban' projemiz için şu an İstanbul'da pilot bir grup kuruyoruz. Komşu bir işletme olarak bu ağın ilk parçası olup fikrinizi belirtirseniz çok sevinirim. Detayları ileteyim mi?"
                    },
                    C: {
                      name: "The Analyst (Data & Retention)",
                      description: "Gelmeyi bırakan müşteriyi otomatik tespit edip 'Seni Özledik' mesajı atan Müşteri Kurtarma; 1 ay ücretsiz pilot ile ciro değişimi.",
                      template: "Merhabalar, kolay gelsin :) [Kafe]'nin sevenleri çoktur ama ya gelmeyi bırakanlar? Kaffiy ile sadece kağıt kartları dijitalleştirmiyoruz; sistem gelmeyi bırakan müşterinizi otomatik tespit edip ona 'Seni Özledik' mesajı atıyor. Pilot programımız kapsamında 1 ay boyunca bu 'Müşteri Kurtarma' özelliğini ücretsiz test etmek ve cironuzdaki değişimi görmek ister misiniz?"
                    },
                    D: {
                      name: "The Closer (Churn Recovery)",
                      description: "Müşteri Kaybı odaklı; gelme periyodunu %90 isabetle tahmin edip gelmeyeni otomatik geri çağıran sistem; global öncesi 10 kafe ile ücretsiz 1 ay pilot.",
                      template: "Merhabalar, kolay gelsin :) Biz Kaffiy olarak en büyük soruna odaklandık: Müşteri Kaybı. Algoritmamız bir müşterinin gelme periyodunu %90 isabetle tahmin ediyor ve gelmediği an onu otomatik geri çağırıyor. Global başvurularımız öncesi bu sistemi 1 ay boyunca ücretsiz deneyerek başarı hikayemizin bir parçası olacak 10 kafeden biri olmak ister misiniz? 30 saniyelik demo linkini iletiyorum."
                    }
                  };
                  const selectedStrategyObj = STRATEGIES[strategy] || STRATEGIES["A"];

                  const prompt = (
                    `Sen Kaffiy'in kurucusu Oğuz'sun. ${selectedStrategyObj.name} stratejisini kullanarak mesaj yazacaksın.\n\n` +
                    `Strateji Açıklaması: ${selectedStrategyObj.description}\n\n` +
                    `Şablon (ana tema ve Pilot Program vurgusu): ${selectedStrategyObj.template}\n\n` +
                    `Talimat: Metnin ana temasını ve 'Pilot Program' vurgusunu koruyarak, gönderilecek kafenin ismini doğal bir şekilde cümlenin içine yerleştir. Kafe ismi: '${cafeName}' (${city}). WhatsApp tonunda kısa ve samimi yaz; mail veya uzun paragraf yazma. Mesaj tamamen Türkçe olsun; tırnak işareti kullanma.\n`
                  );

                  const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                      model: "gpt-4o-mini",
                      messages: [{ role: "user", content: prompt }],
                      max_tokens: 220,
                    }),
                  });

                  if (!response.ok) {
                    const text = await response.text();
                    res.statusCode = 500;
                    res.end(text || "OpenAI request failed");
                    return;
                  }

                  const data = await response.json();
                  const message = data?.choices?.[0]?.message?.content?.trim() || "";
                  if (message && leadIndex >= 0) {
                    leads[leadIndex] = {
                      ...leads[leadIndex],
                      "Ready Message": message,
                      "Active Strategy": strategy,
                    };
                    await fs.mkdir(path.dirname(leadsPath), { recursive: true });
                    await fs.writeFile(leadsPath, JSON.stringify(leads, null, 2), "utf-8");
                  }
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ message }));
                } catch (error) {
                  res.statusCode = 500;
                  res.end("Failed to regenerate message");
                  server.config.logger.error(String(error));
                }
              });
              return;
            }
            if (req.method === "PUT" && req.url?.startsWith("/api/settings")) {
              let body = "";
              req.on("data", (chunk) => {
                body += chunk;
              });
              req.on("end", async () => {
                try {
                  const parsed = JSON.parse(body);
                  const dataPath = path.resolve(__dirname, "src/data/settings.json");
                  await fs.mkdir(path.dirname(dataPath), { recursive: true });
                  await fs.writeFile(dataPath, JSON.stringify(parsed, null, 2), "utf-8");
                  res.statusCode = 200;
                  res.end("ok");
                } catch (error) {
                  res.statusCode = 500;
                  res.end("Failed to write settings");
                  server.config.logger.error(String(error));
                }
              });
              return;
            }
            if (req.method === "POST" && req.url === "/api/delete_lead_from_sheets") {
              let body = "";
              req.on("data", (chunk) => { body += chunk; });
              req.on("end", () => {
                const botPath = path.resolve(__dirname, "../../kaffiy_bot/bot.py");
                const proc = spawn("python", [botPath, "--delete-lead"], {
                  stdio: ["pipe", "pipe", "pipe"],
                  cwd: path.resolve(__dirname, "../../kaffiy_bot"),
                });
                proc.stdin.write(body);
                proc.stdin.end();
                let out = "";
                let err = "";
                proc.stdout?.on("data", (d) => { out += d; });
                proc.stderr?.on("data", (d) => { err += d; });
                let responseSent = false;
                proc.on("close", (code) => {
                  if (responseSent) return;
                  responseSent = true;
                  if (code === 0 && out.trim() === "OK") {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ ok: true }));
                  } else {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ ok: false, notFound: out.trim() === "NOT_FOUND" }));
                  }
                });
                proc.on("error", () => {
                  if (responseSent) return;
                  responseSent = true;
                  res.statusCode = 500;
                  res.end("Failed to run delete script");
                });
              });
              return;
            }
            if (req.method === "POST" && req.url === "/api/deleted_leads") {
              let body = "";
              req.on("data", (chunk) => { body += chunk; });
              req.on("end", async () => {
                try {
                  const lead = JSON.parse(body);
                  const deletedPath = path.resolve(__dirname, "src/data/deleted_leads.json");
                  let list = [];
                  try {
                    const raw = await fs.readFile(deletedPath, "utf-8");
                    list = JSON.parse(raw);
                    if (!Array.isArray(list)) list = [];
                  } catch {
                    list = [];
                  }
                  list.push({
                    ...lead,
                    _deleted_at: new Date().toISOString(),
                  });
                  await fs.mkdir(path.dirname(deletedPath), { recursive: true });
                  await fs.writeFile(deletedPath, JSON.stringify(list, null, 2), "utf-8");
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: true }));
                } catch (error) {
                  res.statusCode = 500;
                  res.end("Failed to save deleted lead");
                  server.config.logger.error(String(error));
                }
              });
              return;
            }
            if (req.method === "POST" && req.url === "/api/log_sent_message") {
              let body = "";
              req.on("data", (chunk) => { body += chunk; });
              req.on("end", async () => {
                try {
                  const { companyName, phone, message } = JSON.parse(body || "{}");
                  const sentPath = path.resolve(__dirname, "src/data/sent_messages.json");
                  await fs.mkdir(path.dirname(sentPath), { recursive: true });
                  let list: { phone?: string; type?: string }[] = [];
                  try {
                    const raw = await fs.readFile(sentPath, "utf-8");
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) list = parsed;
                  } catch {
                    // dosya yok veya bozuk
                  }
                  const phoneNorm = (phone ?? "").replace(/\D/g, "");
                  const isFollowUp = list.some((e) => (String(e.phone ?? "").replace(/\D/g, "") === phoneNorm));
                  list.push({
                    companyName: companyName ?? "",
                    phone: phone ?? "",
                    message: message ?? "",
                    sentAt: new Date().toISOString(),
                    source: "dashboard",
                    type: isFollowUp ? "follow_up" : "initial",
                  });
                  await fs.writeFile(sentPath, JSON.stringify(list, null, 2), "utf-8");
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: true }));
                } catch (error) {
                  res.statusCode = 500;
                  res.end("Failed to log sent message");
                  server.config.logger.error(String(error));
                }
              });
              return;
            }
            if (req.method === "POST" && req.url === "/api/request_press_enter") {
              try {
                const pressPath = path.resolve(__dirname, "src/data/press_enter.json");
                const payload = JSON.stringify({ requested: true, at: Date.now() }, null, 2);
                await fs.mkdir(path.dirname(pressPath), { recursive: true });
                await fs.writeFile(pressPath, payload, "utf-8");
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ ok: true }));
              } catch (error) {
                res.statusCode = 500;
                res.end("Failed to write press_enter");
                server.config.logger.error(String(error));
              }
              return;
            }
            // AI Bot (Kaffiy AI Marketer) start/stop/status - dashboard'dan tek tıkla yönetim
            const aiBotPidPath = path.resolve(__dirname, "src/data/ai_bot_pid.json");
            const kaffiyBotDir = path.resolve(__dirname, "..", "..", "kaffiy_bot");
            const aiMarketerScript = path.resolve(kaffiyBotDir, "kaffiy_ai_marketer.py");
            if (req.method === "GET" && req.url === "/api/ai-bot/status") {
              try {
                let pid: number | undefined;
                try {
                  const raw = await fs.readFile(aiBotPidPath, "utf-8");
                  const data = JSON.parse(raw);
                  pid = typeof data?.pid === "number" ? data.pid : undefined;
                } catch {
                  pid = undefined;
                }
                let running = false;
                if (pid != null) {
                  try {
                    process.kill(pid, 0);
                    running = true;
                  } catch {
                    running = false;
                    await fs.unlink(aiBotPidPath).catch(() => { });
                  }
                }
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ running, pid: running ? pid : undefined }));
              } catch (error) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ running: false, error: String(error) }));
              }
              return;
            }
            if (req.method === "POST" && req.url === "/api/ai-bot/start") {
              try {
                let existingPid: number | undefined;
                try {
                  const raw = await fs.readFile(aiBotPidPath, "utf-8");
                  const data = JSON.parse(raw);
                  existingPid = typeof data?.pid === "number" ? data.pid : undefined;
                } catch {
                  existingPid = undefined;
                }
                if (existingPid != null) {
                  try {
                    process.kill(existingPid, 0);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ running: true, pid: existingPid }));
                    return;
                  } catch {
                    // process dead, continue to start new one
                  }
                }
                // WAHA (Docker) yoksa otomatik baslat - bloklamadan arka planda calistir
                const wahaApiKey = "72c66d88d5ff48e9b9236e5503ef9dbd";
                try {
                  const wahaStart =
                    platform() === "win32"
                      ? `docker start kaffiy_waha 2>nul || docker run -d -p 3000:3000 -e WAHA_API_KEY=${wahaApiKey} --name kaffiy_waha devlikeapro/waha`
                      : `docker start kaffiy_waha 2>/dev/null || docker run -d -p 3000:3000 -e WAHA_API_KEY=${wahaApiKey} --name kaffiy_waha devlikeapro/waha`;
                  const shell = platform() === "win32" ? "cmd" : "sh";
                  const shellArg = platform() === "win32" ? "/c" : "-c";
                  spawn(shell, [shellArg, wahaStart], { detached: true, stdio: "ignore", cwd: path.resolve(__dirname, "../..") }).unref();
                } catch {
                  // Docker yok veya hata - devam et, bot WAHA hazir olana kadar dongude bekleyecek
                }
                const proc = spawn("python", [aiMarketerScript], {
                  cwd: kaffiyBotDir,
                  stdio: "inherit", // Show output in terminal
                });
                const pid = proc.pid;
                if (pid == null) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ running: false, error: "Failed to get process id" }));
                  return;
                }
                await fs.mkdir(path.dirname(aiBotPidPath), { recursive: true });
                await fs.writeFile(aiBotPidPath, JSON.stringify({ pid }, null, 2), "utf-8");
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ running: true, pid }));
              } catch (error) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ running: false, error: String(error) }));
              }
              return;
            }
            if (req.method === "POST" && req.url === "/api/ai-bot/stop") {
              try {
                let pid: number | undefined;
                try {
                  const raw = await fs.readFile(aiBotPidPath, "utf-8");
                  const data = JSON.parse(raw);
                  pid = typeof data?.pid === "number" ? data.pid : undefined;
                } catch {
                  pid = undefined;
                }
                const killPid = (p: number) => {
                  try {
                    if (platform() === "win32") {
                      execSync(`taskkill /F /PID ${p}`, { stdio: "ignore" });
                    } else {
                      process.kill(p, "SIGKILL");
                    }
                  } catch {
                    // already dead or not found
                  }
                };
                if (pid != null) {
                  killPid(pid);
                  await fs.unlink(aiBotPidPath).catch(() => { });
                }
                // Terminalden baslatilmis kaffiy_ai_marketer.py süreçlerini de durdur
                if (platform() === "win32") {
                  try {
                    const ps = "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'python.exe' -and $_.CommandLine -like '*kaffiy_ai_marketer*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }";
                    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${ps.replace(/"/g, '\\"')}"`, { stdio: "ignore", timeout: 8000 });
                  } catch {
                    // powershell yok veya hata - devam et, PID dosyasindaki süreç zaten durduruldu
                  }
                } else {
                  try {
                    const out = execSync("pgrep -f kaffiy_ai_marketer || true", { encoding: "utf-8" });
                    out.trim().split(/\s+/).forEach((id) => {
                      const p = parseInt(id, 10);
                      if (!Number.isNaN(p)) killPid(p);
                    });
                  } catch {
                    // pgrep yok veya hata
                  }
                }
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ running: false }));
              } catch (error) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ running: false, error: String(error) }));
              }
              return;
            }
            if (req.method === "GET" && req.url === "/api/bot-stats") {
              try {
                const botStatsPath = path.resolve(__dirname, "src/data/bot_stats.json");
                const raw = await fs.readFile(botStatsPath, "utf-8").catch(() => "{}");
                const data = JSON.parse(raw);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
              } catch (error) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ funnel: {}, ai_learning: [], ai_log: [], last_conversations: [] }));
              }
              return;
            }
            if (req.method === "GET" && req.url === "/api/scraper-status") {
              try {
                const statusPath = path.resolve(__dirname, "src/data/scraper_status.json");
                const raw = await fs.readFile(statusPath, "utf-8").catch(() => "{}");
                const data = JSON.parse(raw);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
              } catch (error) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ status: "error", details: String(error) }));
              }
              return;
            }
            if (req.method === "GET" && req.url === "/api/scraped-leads") {
              try {
                const leadsPath = path.resolve(__dirname, "src/data/scraped_leads.json");
                const raw = await fs.readFile(leadsPath, "utf-8").catch(() => "[]");
                const data = JSON.parse(raw);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(Array.isArray(data) ? data : []));
              } catch (error) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify([]));
              }
              return;
            }
            if (req.method === "POST" && req.url === "/api/run-scraper") {
              let body = "";
              req.on("data", (chunk) => { body += chunk; });
              req.on("end", async () => {
                try {
                  const { query = "", city = "İstanbul", county = "", searchStrings, maxResults = 20, usePlaces = false } = JSON.parse(body || "{}");
                  const useApify = Array.isArray(searchStrings) && searchStrings.length > 0;
                  const max = Math.min(100, Math.max(1, Number(maxResults) || 20));
                  let argv = useApify
                    ? ["-m", "kaffiy_scraper_bot", "--search-strings", searchStrings.map(String).join(","), "--city", String(city), "--county", String(county), "--max", String(max)]
                    : ["-m", "kaffiy_scraper_bot", "--query", String(query), "--city", String(city), "--max", String(max)];
                  if (usePlaces) argv = [...argv, "--places"];
                  const proc = spawn("python", argv, {
                    stdio: ["ignore", "pipe", "pipe"],
                    cwd: path.resolve(__dirname, "../.."),
                  });
                  let out = "";
                  let err = "";
                  proc.stdout?.on("data", (d) => { out += d; });
                  proc.stderr?.on("data", (d) => { err += d; });
                  await new Promise<void>((resolve, reject) => {
                    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(err || out || "Non-zero exit"))));
                    proc.on("error", reject);
                  });
                  const statusPath = path.resolve(__dirname, "src/data/scraper_status.json");
                  const statusRaw = await fs.readFile(statusPath, "utf-8").catch(() => "{}");
                  const statusData = JSON.parse(statusRaw);
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: true, details: statusData.details || "Tamamlandı" }));
                } catch (error) {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: false, error: String(error) }));
                }
              });
              return;
            }
            if (req.method === "POST" && req.url === "/api/scraped-leads/mark-website-fix") {
              let body = "";
              req.on("data", (chunk) => { body += chunk; });
              req.on("end", async () => {
                try {
                  const parsed = JSON.parse(body || "{}");
                  const ids = Array.isArray(parsed.ids) ? parsed.ids : (parsed.id ? [parsed.id] : []);
                  const scrapedPath = path.resolve(__dirname, "src/data/scraped_leads.json");
                  let scraped: Array<Record<string, unknown>> = [];
                  try {
                    const raw = await fs.readFile(scrapedPath, "utf-8");
                    scraped = JSON.parse(raw);
                    if (!Array.isArray(scraped)) scraped = [];
                  } catch {
                    scraped = [];
                  }
                  for (const id of ids) {
                    const idx = scraped.findIndex((s) => String((s as Record<string, string>).ID ?? "") === id);
                    if (idx !== -1) (scraped[idx] as Record<string, unknown>)["isWebsiteFixCandidate"] = true;
                  }
                  await fs.writeFile(scrapedPath, JSON.stringify(scraped, null, 2), "utf-8");
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: true, marked: ids.length }));
                } catch (error) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: false, error: String(error) }));
                }
              });
              return;
            }
            if (req.method === "POST" && req.url === "/api/scraped-leads/unmark-website-fix") {
              let body = "";
              req.on("data", (chunk) => { body += chunk; });
              req.on("end", async () => {
                try {
                  const parsed = JSON.parse(body || "{}");
                  const ids = Array.isArray(parsed.ids) ? parsed.ids : (parsed.id ? [parsed.id] : []);
                  const scrapedPath = path.resolve(__dirname, "src/data/scraped_leads.json");
                  let scraped: Array<Record<string, unknown>> = [];
                  try {
                    const raw = await fs.readFile(scrapedPath, "utf-8");
                    scraped = JSON.parse(raw);
                    if (!Array.isArray(scraped)) scraped = [];
                  } catch {
                    scraped = [];
                  }
                  for (const id of ids) {
                    const idx = scraped.findIndex((s) => String((s as Record<string, string>).ID ?? "") === id);
                    if (idx !== -1) delete (scraped[idx] as Record<string, unknown>)["isWebsiteFixCandidate"];
                  }
                  await fs.writeFile(scrapedPath, JSON.stringify(scraped, null, 2), "utf-8");
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: true, unmarked: ids.length }));
                } catch (error) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: false, error: String(error) }));
                }
              });
              return;
            }
            if (req.method === "POST" && req.url === "/api/scraped-leads/add-selected-to-leads") {
              let body = "";
              req.on("data", (chunk) => { body += chunk; });
              req.on("end", async () => {
                try {
                  const parsed = JSON.parse(body || "{}");
                  const idsToAdd = Array.isArray(parsed.ids) ? parsed.ids : (parsed.id ? [parsed.id] : []);
                  const leadsPath = path.resolve(__dirname, "src/data/leads_data.json");
                  const scrapedPath = path.resolve(__dirname, "src/data/scraped_leads.json");
                  let leads: Array<Record<string, string | number>> = [];
                  let scraped: Array<Record<string, unknown>> = [];
                  try {
                    const leadsRaw = await fs.readFile(leadsPath, "utf-8");
                    leads = JSON.parse(leadsRaw);
                    if (!Array.isArray(leads)) leads = [];
                  } catch {
                    leads = [];
                  }
                  try {
                    const scrapedRaw = await fs.readFile(scrapedPath, "utf-8");
                    scraped = JSON.parse(scrapedRaw);
                    if (!Array.isArray(scraped)) scraped = [];
                  } catch {
                    scraped = [];
                  }
                  const maxId = leads.reduce((m, r) => Math.max(m, Number(r.ID) || 0), 0);
                  let nextId = maxId + 1;
                  const added: string[] = [];
                  const remaining = scraped.filter((s) => {
                    const id = String((s as Record<string, string>).ID ?? "");
                    if (!idsToAdd.includes(id)) return true;
                    const sRec = s as Record<string, unknown>;
                    const websiteFix = Boolean(sRec.isWebsiteFixCandidate);
                    const lead: Record<string, string | number> = { ...s } as Record<string, string | number>;
                    delete lead._scraped_at;
                    delete lead._source;
                    lead.ID = String(nextId++);
                    lead["Lead Status"] = "Ready";
                    if (websiteFix) lead["Service Tag"] = "Web sitesi düzeltilecek";
                    leads.push(lead);
                    added.push(id);
                    return false;
                  });
                  await fs.writeFile(leadsPath, JSON.stringify(leads, null, 2), "utf-8");
                  await fs.writeFile(scrapedPath, JSON.stringify(remaining, null, 2), "utf-8");
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: true, added: added.length }));
                } catch (error) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: false, error: String(error) }));
                }
              });
              return;
            }
            if (req.method === "POST" && req.url === "/api/scraped-leads/reject") {
              let body = "";
              req.on("data", (chunk) => { body += chunk; });
              req.on("end", async () => {
                try {
                  const parsed = JSON.parse(body || "{}");
                  const idsToReject = Array.isArray(parsed.ids) ? parsed.ids : (parsed.id ? [parsed.id] : []);
                  const scrapedPath = path.resolve(__dirname, "src/data/scraped_leads.json");
                  let scraped: Array<Record<string, unknown>> = [];
                  try {
                    const raw = await fs.readFile(scrapedPath, "utf-8");
                    scraped = JSON.parse(raw);
                    if (!Array.isArray(scraped)) scraped = [];
                  } catch {
                    scraped = [];
                  }
                  const remaining = scraped.filter((s) => !idsToReject.includes(String((s as Record<string, string>).ID ?? "")));
                  await fs.writeFile(scrapedPath, JSON.stringify(remaining, null, 2), "utf-8");
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: true, removed: scraped.length - remaining.length }));
                } catch (error) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: false, error: String(error) }));
                }
              });
              return;
            }
            if (req.method === "POST" && req.url === "/api/leads/update-status") {
              let body = "";
              req.on("data", (chunk) => { body += chunk; });
              req.on("end", async () => {
                try {
                  const { phone, status, field, original_message, approved_message, is_edited, reason } = JSON.parse(body || "{}");
                  const leadsPath = path.resolve(__dirname, "src/data/leads_data.json");
                  let leads: any[] = [];
                  try {
                    const raw = await fs.readFile(leadsPath, "utf-8");
                    leads = JSON.parse(raw);
                  } catch { leads = []; }

                  const phoneNorm = String(phone || "").replace(/\D/g, '');
                  const idx = leads.findIndex(l => String(l.Phone || "").replace(/\D/g, '') === phoneNorm);
                  if (idx !== -1) {
                    // Force "Approved" status when user approves (not just "Contacted")
                    if (status === "Contacted" || approved_message) {
                      leads[idx][field] = "Approved";
                    } else {
                      leads[idx][field] = status;
                    }

                    // IF EDITED: Update the message intended for sending AND save to learning dataset
                    if (is_edited && approved_message) {
                      leads[idx]["Suggested_Response"] = approved_message;
                      leads[idx]["Ready Message"] = approved_message;

                      // Save to Reinforcement Learning Dataset (correct_examples.json)
                      try {
                        const examplesPath = path.resolve(__dirname, "src/data/correct_examples.json");
                        let examples = [];
                        try {
                          const rawEx = await fs.readFile(examplesPath, "utf-8");
                          examples = JSON.parse(rawEx);
                          if (!Array.isArray(examples)) examples = [];
                        } catch { examples = []; }

                        // Find the last incoming message from this user (context)
                        const incoming = leads[idx]["Last_Incoming_Body"] || leads[idx]["Last_Message"] || "";

                        if (incoming) {
                          examples.push({
                            input: incoming,
                            output: approved_message,
                            original_ai_output: original_message,
                            rationale: reason || "", // User's reasoning
                            timestamp: new Date().toISOString()
                          });
                          await fs.writeFile(examplesPath, JSON.stringify(examples, null, 2), "utf-8");
                        }
                      } catch (err) {
                        console.error("Failed to save learning example:", err);
                      }
                    }

                    await fs.writeFile(leadsPath, JSON.stringify(leads, null, 2), "utf-8");

                    // UPDATE BOT STATS (Pending Approvals) IMMEDIATELY to reflect changes in UI
                    try {
                      const statsPath = path.resolve(__dirname, "src/data/bot_stats.json");
                      const rawStats = await fs.readFile(statsPath, "utf-8").catch(() => "{}");
                      const stats = JSON.parse(rawStats);

                      if (stats.pending_approvals && Array.isArray(stats.pending_approvals)) {
                        // Helper to clean phone
                        const clean = (p: string) => String(p || "").replace(/\D/g, "");
                        const target = clean(phone);

                        const newPending = stats.pending_approvals.filter((p: any) => clean(p.phone) !== target);

                        if (newPending.length !== stats.pending_approvals.length) {
                          stats.pending_approvals = newPending;
                          await fs.writeFile(statsPath, JSON.stringify(stats, null, 2), "utf-8");
                        }
                      }
                    } catch (e) {
                      console.error("Failed to update bot stats pending list:", e);
                    }
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ ok: true }));
                  } else {
                    res.statusCode = 404;
                    res.end("Lead not found");
                  }
                } catch (error) {
                  res.statusCode = 500;
                  res.end("Error updating lead status");
                }
              });
              return;
            }
            if (req.method !== "PUT" || !req.url?.startsWith("/api/leads_data")) {
              return next();
            }

            let body = "";
            req.on("data", (chunk) => {
              body += chunk;
            });

            req.on("end", async () => {
              try {
                JSON.parse(body);
              } catch {
                res.statusCode = 400;
                res.end("Invalid JSON");
                return;
              }

              try {
                const dataPath = path.resolve(__dirname, "src/data/leads_data.json");
                await fs.mkdir(path.dirname(dataPath), { recursive: true });
                await fs.writeFile(dataPath, body, "utf-8");
                res.statusCode = 200;
                res.end("ok");
              } catch (error) {
                res.statusCode = 500;
                res.end("Failed to write file");
                server.config.logger.error(String(error));
              }
            });
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
});
