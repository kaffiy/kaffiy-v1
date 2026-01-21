import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "node:fs/promises";

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
                const botEnv = await loadEnvFile(path.resolve(__dirname, "..", "..", "kaffiy_bot", ".env"));
                const apiKey = env.OPENAI_API_KEY || botEnv.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

                if (!apiKey) {
                  res.statusCode = 500;
                  res.end("Missing OPENAI_API_KEY (set in kaffiy-growth-hub-main/.env)");
                  return;
                }

                const STRATEGIES: Record<string, { name: string; description: string; template: string }> = {
                  A: {
                    name: "Fikir Alma / Beta Testi",
                    description: "En az reddedilen yöntem. Bir şey satmıyorsun, sadece onlardan 'akıl hocası' olmalarını istiyorsun. İnsanlar fikir vermeyi sever.",
                    template: "Merhabalar, kolay gelsin :) Bir arkadaşımla birlikte Tech İstanbul bünyesinde butik kafeler için Starbucks uygulamasının daha pratik bir versiyonunu geliştiriyoruz. Şu an sadece seçtiğim birkaç işletmenin fikrini almak istiyorum. Satış değil, tamamen tecrübenize dayanarak 'olmuş mu' diye yorumunuzu rica edecektim. Kısaca bahsetmemi ister misiniz?"
                  },
                  B: {
                    name: "Komşu Yaklaşımı",
                    description: "Bölgesel güven. 'Dışarıdan biri' değil, 'Bizden biri' imajı verirsin.",
                    template: "Merhabalar, kolay gelsin :) Ben de bu semtte yaşayan bir girişimciyim. Tech İstanbul çatısı altında, mahallemizdeki kafeler büyük zincirlerle daha rahat rekabet edebilsin diye bir sistem kurduk. Komşu bir işletme olarak projemize bir göz atıp fikrinizi belirtirseniz çok sevinirim."
                  },
                  C: {
                    name: "Doğrudan Fayda",
                    description: "Hiç dolandırmadan, direkt acıya dokunmak. Açık sözlü yaklaşım.",
                    template: "Merhabalar, kolay gelsin :) Kahvenizin müdavimi çoktur eminim, peki ya onları dijitalde takip etmek? Bir arkadaşımla Tech İstanbul bünyesinde kurduğumuz Kaffiy ile eski usul kağıt kartları dijitale taşıyoruz. Kurulum ücreti yok, risk yok. 30 saniyelik bir göz atmak ister misiniz?"
                  }
                };
                const selectedStrategy = STRATEGIES[strategy] || STRATEGIES["A"];

                const prompt = (
                  `Sen Kaffiy'in kurucusu Oğuz'sun. ${selectedStrategy.name} stratejisini kullanarak mesaj yazacaksın.\n\n` +
                  `Strateji Açıklaması: ${selectedStrategy.description}\n\n` +
                  `Template Örneği:\n${selectedStrategy.template}\n\n` +
                  `Görev:\n` +
                  `- ${city} şehrindeki ${cafeName} kafesine bu stratejiye uygun bir mesaj yaz.\n` +
                  `- Template'deki gibi samimi, doğal ve merak uyandırıcı bir ton kullan.\n` +
                  `- Asla robotik veya resmi olma. Konuşur gibi yaz.\n` +
                  `- Mesaj tamamen Türkçe olsun.\n` +
                  `- Mesajda tırnak işareti kullanma.\n` +
                  `- Template'deki uzunluk ve yapıyı koru.\n` +
                  `- Template'deki 'bu semtte', 'mahallemizdeki' gibi ifadeleri ${city} şehri bağlamında kullan.\n` +
                  `- Template'deki 'bir arkadaşımla' ifadesini koru.\n` +
                  `- Template'deki 'Tech İstanbul' ifadesini koru.\n`
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
                    max_tokens: 250,
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
