import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexPath = path.join(__dirname, '../index.html');

(async () => {
  console.log('🚀 캡처 스크립트 시작...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  
  // 모바일 위젯에 적합한 가로 사이즈로 설정
  await page.setViewport({ width: 500, height: 1200, deviceScaleFactor: 2 }); 

  console.log('📄 페이지 여는 중: ', `file://${indexPath}`);
  await page.goto(`file://${indexPath}`, { waitUntil: 'networkidle0' });

  // 데이터(json)가 로드되고 렌더링될 때까지 대기
  console.log('⏳ 데이터 로딩 대기...');
  await page.waitForFunction(() => {
    return !document.querySelector('#gameList .loading') && 
           !document.querySelector('#rankTable .loading');
  }, { timeout: 10000 });

  // 폰트 로딩 및 렌더링 안정화를 위해 1초 추가 대기
  await new Promise(r => setTimeout(r, 1000));

  console.log('📸 스크린샷 캡처 중...');
  // 전체 화면 배경색 유지 및 내용 캡처를 위해 body 요소 캡처
  const body = await page.$('body');
  
  // 요소가 화면보다 길면 잘리지 않도록 bounding box 확인
  await body.screenshot({ 
    path: path.join(__dirname, '../shot.png')
  });

  console.log('✅ 스크린샷 저장 완료: shot.png');
  await browser.close();
})();
