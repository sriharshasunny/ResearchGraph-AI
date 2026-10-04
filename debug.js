import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('http://localhost:5173/home_hero.html', {waitUntil: 'networkidle0'});
  await page.screenshot({path: 'hero_screenshot.png'});
  await browser.close();
})();
