const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'frontend/src');

const processFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Page Container variants
    content = content.replace(/<div\s+style=\{\{\s*padding:\s*'24px',\s*background:\s*'#fff',\s*borderRadius:\s*'8px',\s*boxShadow:\s*'0 1px 3px rgba\(0,0,0,0\.05\)'\s*\}\}>/g, '<div className="page-container">');
    content = content.replace(/<div\s+style=\{\{\s*background:\s*'#fff',\s*padding:\s*24,\s*borderRadius:\s*8,\s*minHeight:\s*'100%'\s*\}\}>/g, '<div className="page-container">');
    
    // Page Header variants
    content = content.replace(/<div\s+style=\{\{\s*display:\s*'flex',\s*justifyContent:\s*'space-between',\s*marginBottom:\s*16\s*\}\}>/g, '<div className="page-header">');
    content = content.replace(/<div\s+style=\{\{\s*display:\s*'flex',\s*justifyContent:\s*'space-between',\s*alignItems:\s*'center',\s*marginBottom:\s*16\s*\}\}>/g, '<div className="page-header">');

    // Title and Text variants
    content = content.replace(/<Title\s+level=\{4\}\s+style=\{\{\s*margin:\s*0\s*\}\}>/g, '<Title level={4} className="margin-0">');
    content = content.replace(/<Title\s+level=\{3\}\s+style=\{\{\s*margin:\s*0\s*\}\}>/g, '<Title level={3} className="margin-0">');
    content = content.replace(/<p\s+style=\{\{\s*color:\s*'#888',\s*marginTop:\s*4\s*\}\}>/g, '<p className="text-muted">');
    content = content.replace(/<p\s+style=\{\{\s*color:\s*'#8c8c8c'\s*\}\}>/g, '<p className="text-muted margin-0">');
    content = content.replace(/<p\s+style=\{\{\s*color:\s*'#888',\s*marginTop:\s*4,\s*marginBottom:\s*0\s*\}\}>/g, '<p className="text-muted margin-0">');

    // Icons
    content = content.replace(/style=\{\{\s*color:\s*'#1677ff'\s*\}\}/g, 'className="icon-primary"');
    content = content.replace(/style=\{\{\s*color:\s*'#52c41a'\s*\}\}/g, 'className="icon-success"');
    content = content.replace(/style=\{\{\s*color:\s*'#faad14'\s*\}\}/g, 'className="icon-warning"');
    content = content.replace(/style=\{\{\s*color:\s*'#ff4d4f'\s*\}\}/g, 'className="icon-danger"');

    // Layouts
    content = content.replace(/style=\{\{\s*padding:\s*0,\s*background:\s*'#fff',\s*display:\s*'flex',\s*justifyContent:\s*'space-between',\s*alignItems:\s*'center',\s*boxShadow:\s*'0 1px 4px rgba\(0,21,41,\.08\)',\s*zIndex:\s*1\s*\}\}/g, 'className="layout-header"');
    content = content.replace(/style=\{\{\s*height:\s*32,\s*margin:\s*16,\s*background:\s*'rgba\(0, 0, 0, 0\.05\)',\s*borderRadius:\s*6,\s*display:\s*'flex',\s*alignItems:\s*'center',\s*justifyContent:\s*'center',\s*fontWeight:\s*'bold'\s*\}\}/g, 'className="sidebar-logo-container"');

    // Login page flex center
    content = content.replace(/<div\s+style=\{\{\s*display:\s*'flex',\s*justifyContent:\s*'center',\s*alignItems:\s*'center',\s*height:\s*'100vh',\s*background:\s*'#f0f2f5'\s*\}\}>/g, '<div className="flex-center" style={{ height: \'100vh\', background: \'#f0f2f5\' }}>');

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
console.log('Style refactoring completed.');
