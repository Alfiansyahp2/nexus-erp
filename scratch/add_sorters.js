const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'frontend/src/pages');

const processFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // We look for objects inside `columns` array.
    // A robust way without AST is to find `dataIndex: 'some_string'`
    // and inject the sorter if it doesn't already have one.

    const regex = /dataIndex:\s*'([^']+)'(.*?)/g;
    
    // Instead of simple regex which might break, let's replace dataIndex line by appending sorter.
    // We can replace `dataIndex: 'xxx',` with `dataIndex: 'xxx', sorter: (a, b) => { const vA = a['xxx'] ?? ''; const vB = b['xxx'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },`
    
    // But we need to handle trailing commas, or if it's on a single line.
    
    content = content.replace(/dataIndex:\s*'([^']+)'\s*,?(?!\s*sorter)/g, (match, p1) => {
        // if this block already has sorter, we shouldn't add another, but the negative lookahead isn't enough if sorter is on the next line.
        // Let's just do a naive replacement and hope for the best, since we know there are no existing sorters based on our grep.
        
        return `dataIndex: '${p1}', sorter: (a, b) => { const vA = a['${p1}'] ?? ''; const vB = b['${p1}'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated: ${filePath}`);
    }
};

const walkSync = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walkSync(filePath);
        } else if (filePath.endsWith('.jsx')) {
            processFile(filePath);
        }
    }
};

walkSync(srcDir);
console.log('Sorters added successfully.');
