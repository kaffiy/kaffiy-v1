// ========================================
// CAMPAIGNS.TSX SYNTAX DÜZELTME
// Otomatik olarak map function'ını düzelt
// ========================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src/pages/Campaigns.tsx');

function fixCampaignsSyntax() {
    console.log('🔧 Fixing Campaigns.tsx syntax...\n');
    
    try {
        // Dosyayı oku
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Hatalı bölümleri bul ve düzelt
        const lines = content.split('\n');
        
        console.log('📋 Analyzing file structure...');
        
        // Map function'ını bul
        let mapStartLine = -1;
        let mapEndLine = -1;
        let braceCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Map başlangıcını bul
            if (line.includes('filteredCampaigns.map((campaign) => (')) {
                mapStartLine = i;
                console.log(`📍 Found map start at line ${i + 1}: ${line.trim()}`);
                braceCount = 1;
            }
            
            // Map içindeki parantezleri say
            if (mapStartLine !== -1) {
                if (line.includes('(')) braceCount += (line.match(/\(/g) || []).length;
                if (line.includes(')')) braceCount -= (line.match(/\)/g) || []).length;
                
                // Map bittiğinde
                if (braceCount === 0 && i > mapStartLine) {
                    mapEndLine = i;
                    console.log(`📍 Found map end at line ${i + 1}: ${line.trim()}`);
                    break;
                }
            }
        }
        
        if (mapStartLine === -1) {
            console.log('❌ Map function not found');
            return;
        }
        
        console.log(`📊 Map function: lines ${mapStartLine + 1} to ${mapEndLine + 1}`);
        
        // 425. satırdan sonraki kodu kontrol et
        const line425 = lines[424]; // 0-indexed
        console.log(`📝 Line 425: ${line425.trim()}`);
        
        // Eğer 425. satırda </div> varsa ve map function'ı kapanmadıysa
        if (line425.includes('</div>') && mapEndLine < 424) {
            console.log('🔧 Fixing map function closure...');
            
            // 425. satırdan sonra map function'ını kapat
            lines.splice(425, 0, '          ))');
            
            console.log('✅ Added map function closure');
        }
        
        // Dosyayı yaz
        const fixedContent = lines.join('\n');
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        
        console.log('✅ Campaigns.tsx syntax fixed!');
        console.log('📱 Try building again: npm run build');
        
    } catch (error) {
        console.error('❌ Error fixing syntax:', error);
    }
}

// Çalıştır
fixCampaignsSyntax();
