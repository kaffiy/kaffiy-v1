// ========================================
// CAMPAIGNS.TSX SON DÜZELTME
// Eksik parantezi otomatik olarak ekle
// ========================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src/pages/Campaigns.tsx');

function fixCampaignsFinal() {
    console.log('🔧 Final fix for Campaigns.tsx...\n');
    
    try {
        // Dosyayı oku
        let content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        console.log('📋 Looking for missing closing parenthesis...');
        
        // 362. satırda başlayan conditional render'ı bul
        let conditionalStart = -1;
        let conditionalEnd = -1;
        let braceCount = 0;
        let inConditional = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Conditional render başlangıcı bul
            if (line.includes('{campaign.status !== "scheduled" && (')) {
                conditionalStart = i;
                inConditional = true;
                braceCount = 2; // { ve (
                console.log(`📍 Found conditional start at line ${i + 1}: ${line.trim()}`);
            }
            
            // Conditional render içindeyken parantezleri say
            if (inConditional) {
                if (line.includes('{')) braceCount += (line.match(/\{/g) || []).length;
                if (line.includes('}')) braceCount -= (line.match(/\}/g) || []).length;
                
                // Conditional render bittiğinde
                if (braceCount === 0 && i > conditionalStart) {
                    conditionalEnd = i;
                    console.log(`📍 Found conditional end at line ${i + 1}: ${line.trim()}`);
                    
                    // Eğer kapanış parantezi yoksa ekle
                    if (!line.includes(')}')) {
                        lines[i] = line + ')}';
                        console.log(`✅ Added closing parenthesis at line ${i + 1}`);
                    }
                    
                    inConditional = false;
                    break;
                }
            }
        }
        
        if (conditionalStart === -1) {
            console.log('❌ Conditional render not found');
            return;
        }
        
        console.log(`📊 Conditional render: lines ${conditionalStart + 1} to ${conditionalEnd + 1}`);
        
        // Dosyayı yaz
        const fixedContent = lines.join('\n');
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        
        console.log('✅ Campaigns.tsx fixed successfully!');
        console.log('📱 Try building again: npm run build');
        
    } catch (error) {
        console.error('❌ Error fixing file:', error);
    }
}

// Çalıştır
fixCampaignsFinal();
