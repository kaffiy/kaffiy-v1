import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";

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
                    template: "Merhabalar :) Ben de mahallenin bir girişimcisiyim. Tech İstanbul çatısı altında, yerel esnafın birbirine akıllıca müşteri yönlendirdiği bir dayanışma ağı kuruyoruz. Bu 'Akıllı Ara Taban' projemiz için şu an İstanbul'da pilot bir grup kuruyoruz. Komşu bir işletme olarak bu ağın ilk parçası olup fikrinizi belirtirseniz çok sevinirim. Detayları ileteyim mi?"
                  },
                  C: {
                    name: "The Analyst (Data & Retention)",
                    description: "Gelmeyi bırakan müşteriyi otomatik tespit edip 'Seni Özledik' mesajı atan Müşteri Kurtarma; 1 ay ücretsiz pilot ile ciro değişimi.",
                    template: "Merhabalar :) [Kafe]'nin sevenleri çoktur ama ya gelmeyi bırakanlar? Kaffiy ile sadece kağıt kartları dijitalleştirmiyoruz; sistem gelmeyi bırakan müşterinizi otomatik tespit edip ona 'Seni Özledik' mesajı atıyor. Pilot programımız kapsamında 1 ay boyunca bu 'Müşteri Kurtarma' özelliğini ücretsiz test etmek ve cironuzdaki değişimi görmek ister misiniz?"
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
              proc.on("close", (code) => {
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
