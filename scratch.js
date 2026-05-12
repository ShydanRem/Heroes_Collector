const fs = require('fs');
const code = fs.readFileSync('backend/src/services/battleEngine.ts', 'utf8');
let count = 0;
let lines = code.split('\n');
for(let i=0; i<lines.length; i++) {
  let line = lines[i];
  // ignore comments roughly
  if (line.trim().startsWith('//')) continue;
  
  for(let char of line) {
    if(char === '{') count++;
    if(char === '}') count--;
    if(count === 0 && i > 150) { 
        console.log('Zero at line', i+1); 
    }
  }
}
