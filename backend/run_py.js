const { execSync } = require('child_process');
const fs = require('fs');
try {
  const output = execSync('python "d:/New folder/smart-healthcare-system/backend/predict_heart.py" --info').toString();
  fs.writeFileSync('d:/New folder/smart-healthcare-system/backend/py_out.txt', output);
} catch (e) {
  fs.writeFileSync('d:/New folder/smart-healthcare-system/backend/py_out.txt', "Error: " + e.message);
}
