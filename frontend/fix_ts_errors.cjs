const fs = require('fs');
const path = require('path');

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
        let newContent = content;

        // Fix missing "type" in imports for verbatimModuleSyntax
        newContent = newContent.replace(/import {([^}]*)} from "(\.\.\/services\/organizationsApi|@\/features\/organizations\/services\/organizationsApi)"/g, (match, p1, p2) => {
            const types = p1.split(',').map(s => s.trim()).filter(s => !!s);
            const nonTypes = types.filter(t => t === 'organizationsApi');
            const onlyTypes = types.filter(t => t !== 'organizationsApi');
            let res = '';
            if (nonTypes.length > 0) res += `import { ${nonTypes.join(', ')} } from "${p2}"\n`;
            if (onlyTypes.length > 0) res += `import type { ${onlyTypes.join(', ')} } from "${p2}"\n`;
            return res.trim();
        });
        
        newContent = newContent.replace(/import {([^}]*)} from "(\.\.\/services\/devicesApi)"/g, (match, p1, p2) => {
            const types = p1.split(',').map(s => s.trim()).filter(s => !!s);
            const nonTypes = types.filter(t => t === 'devicesApi');
            const onlyTypes = types.filter(t => t !== 'devicesApi');
            let res = '';
            if (nonTypes.length > 0) res += `import { ${nonTypes.join(', ')} } from "${p2}"\n`;
            if (onlyTypes.length > 0) res += `import type { ${onlyTypes.join(', ')} } from "${p2}"\n`;
            return res.trim();
        });
        
        newContent = newContent.replace(/import {([^}]*)} from "(\.\.\/services\/sitesApi)"/g, (match, p1, p2) => {
            const types = p1.split(',').map(s => s.trim()).filter(s => !!s);
            const nonTypes = types.filter(t => t === 'sitesApi');
            const onlyTypes = types.filter(t => t !== 'sitesApi');
            let res = '';
            if (nonTypes.length > 0) res += `import { ${nonTypes.join(', ')} } from "${p2}"\n`;
            if (onlyTypes.length > 0) res += `import type { ${onlyTypes.join(', ')} } from "${p2}"\n`;
            return res.trim();
        });

        // Remove empty imports if any
        newContent = newContent.replace(/import type { } from "[^"]+"\n/g, '');

        // Fix asChild issue for Triggers
        newContent = newContent.replace(/asChild/g, '');

        // Fix missing useEffect
        if (filePath.includes('OrganizationsPage.tsx') && !newContent.includes('useEffect')) {
            newContent = newContent.replace(/import { useState } from "react"/, 'import { useState, useEffect } from "react"');
        }

        // Fix @base-ui select value typing issues (val is string | null)
        newContent = newContent.replace(/onValueChange=\{\(val\) => setFormData\(\{ \.\.\.formData, ([a-zA-Z0-9_]+): val(?: \|\| "")? \}\)\}/g, 'onValueChange={(val) => setFormData({ ...formData, $1: val || "" })}');
        newContent = newContent.replace(/onValueChange=\{\(val\) => set([a-zA-Z0-9_]+)\(val\)\}/g, 'onValueChange={(val) => set$1(val || "")}');
        newContent = newContent.replace(/onValueChange=\{set([a-zA-Z0-9_]+)\}/g, 'onValueChange={(val) => set$1(val || "")}');

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Fixed:', filePath);
        }
    }
});
