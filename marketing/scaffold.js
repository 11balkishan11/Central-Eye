const fs = require('fs');
const path = require('path');

const routes = [
  '/developers/sdk',
  '/company/about',
  '/company/blog',
  '/company/careers',
  '/company/contact',
  '/solutions/enterprise',
  '/solutions/healthcare',
  '/solutions/manufacturing',
  '/solutions/cloud',
  '/solutions/isp'
];

const basePath = path.join(__dirname, 'src', 'app');

routes.forEach(route => {
  const dirPath = path.join(basePath, route);
  fs.mkdirSync(dirPath, { recursive: true });
  
  const filePath = path.join(dirPath, 'page.tsx');
  const title = route.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  const content = `export default function Page() {
  return (
    <div className="min-h-screen pt-32 pb-16 px-4 bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">${title}</h1>
      <p className="text-gray-400">This page is coming soon.</p>
    </div>
  );
}
`;
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log('Created ' + filePath);
  }
});
