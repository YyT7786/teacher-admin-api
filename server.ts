import 'dotenv/config';
import app from './src/app';

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`\nTeacher Administration API`);
  console.log(`---------------------------`);
  console.log(`  API:     http://localhost:${PORT}`);
  console.log(`  Docs:    http://localhost:${PORT}/api-docs`);
  console.log(`\nPress Ctrl+C to stop.\n`);
});
