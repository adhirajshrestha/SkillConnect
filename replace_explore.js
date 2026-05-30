const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const filesToUpdate = [
    'App.jsx',
    'App1.jsx',
    'AppTeacher.jsx',
    'AfterPayment.jsx',
    'Profile.jsx',
    'TeacherProfile.jsx',
    'Video.jsx',
    'Payment.jsx'
];

filesToUpdate.forEach(fileName => {
    const filePath = path.join(srcDir, fileName);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Remove state
    content = content.replace(/const \[isExploreOpen,\s*setIsExploreOpen\]\s*=\s*useState\(false\);\r?\n?/g, '');
    
    // Remove toggleExplore function
    const toggleFuncRegex = /const toggleExplore\s*=\s*\(\)\s*=>\s*\{\s*setIsExploreOpen\(!isExploreOpen\);\s*\};\r?\n?/g;
    content = content.replace(toggleFuncRegex, '');

    // Replace the block
    const blockRegex = /<div className="explore-container">[\s\S]*?(?:<\/div>\s*<\/div>\s*|\{\/\*.*?\*\/}\s*|)[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\s*\}|(<div className="explore-container">[\s\S]*?\{isExploreOpen && \([\s\S]*?<div className="explore-dropdown">[\s\S]*?<\/div>\s*\)\}\s*<\/div>)/g;
    
    // A more precise regex to match from <div className="explore-container"> to its matching closing tag
    // Since regex can't easily match nested divs, we can match from <div className="explore-container"> down to the closing div of explore-dropdown and then the closing div of explore-container
    const blockPattern = /<div className="explore-container">[\s\S]*?\{isExploreOpen && \([\s\S]*?<div className="explore-dropdown">[\s\S]*?<div className="dropdown-column">[\s\S]*?<\/ul>\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>/g;

    content = content.replace(blockPattern, '<ExploreDropdown />');

    // Also remove the ChevronDown import from lucide-react if present, but since it's grouped, we can just leave it or replace it.
    // Let's add the ExploreDropdown import
    if (!content.includes('import ExploreDropdown from')) {
        content = content.replace(/(import React.*?;\r?\n)/, '$1import ExploreDropdown from "./components/ExploreDropdown";\n');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${fileName}`);
});
