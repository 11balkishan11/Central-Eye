import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('./src', (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content
            .replace(/@\/components\//g, '@/shared/components/')
            .replace(/@\/lib\//g, '@/shared/utils/')
            .replace(/@\/services\//g, '@/shared/services/')
            .replace(/@\/store\//g, '@/shared/providers/')
            .replace(/@\/hooks\//g, '@/shared/hooks/')
            .replace(/@\/types\//g, '@/shared/types/')
            .replace(/@\/utils\//g, '@/shared/utils/');
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Updated:', filePath);
        }
    }
});
