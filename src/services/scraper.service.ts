import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

interface ScrapedData {
  title?: string;
  price?: string;
  location?: string;
  description?: string;
  features?: {
    m2?: string;
    rooms?: string;
    floor?: string;
    buildingAge?: string;
  };
  images?: string[];
}

export const scrapeUrl = async (url: string): Promise<ScrapedData> => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // Open visible browser for manual CAPTCHA solving
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });

    const page = await browser.newPage();
    
    // Let Stealth plugin handle User-Agent to ensure consistency
    // await page.setUserAgent(...); 
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
    });

    // Strategy: Go to Homepage first ONLY for Sahibinden
    if (url.includes('sahibinden.com')) {
      console.log('Navigating to homepage first (Sahibinden only)...');
      await page.goto('https://www.sahibinden.com/', { waitUntil: 'networkidle2', timeout: 60000 });
      await new Promise(r => setTimeout(r, 3000));
    }

    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Now navigate to the actual listing
    console.log('Navigating to listing URL...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Check for Cloudflare Challenge (General)
    let pageTitle = await page.title();
    console.log('Initial Page Title:', pageTitle);

    if (pageTitle.includes('Just a moment') || pageTitle.includes('Attention Required') || pageTitle.includes('Cloudflare') || pageTitle.includes('Bir dakika lütfen')) {
      console.log('Cloudflare challenge detected. Waiting for user to solve it...');
      await new Promise(r => setTimeout(r, 30000));
    }

    // Debug: Take a screenshot
    await page.screenshot({ path: 'scraper_debug.png', fullPage: true });

    // Extract Data
    const data = await page.evaluate(function(url) {
      const result: any = { features: {} };

      // Generic Meta Tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      result.title = ogTitle ? ogTitle.getAttribute('content') : document.title;
      
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const metaDesc = document.querySelector('meta[name="description"]');
      result.description = ogDesc ? ogDesc.getAttribute('content') : (metaDesc ? metaDesc.getAttribute('content') : undefined);
      
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        const imgContent = ogImage.getAttribute('content');
        if (imgContent) result.images = [imgContent];
      }

      // Domain Specific Logic
      if (url.includes('sahibinden.com')) {
        // ... (Sahibinden logic kept as is) ...
        const priceEl = document.querySelector('div.classifiedInfo > h3');
        const priceInput = document.querySelector('input#priceInput') as HTMLInputElement;
        if (priceEl) result.price = priceEl.textContent?.trim();
        else if (priceInput) result.price = priceInput.value;

        const listItems = document.querySelectorAll('ul.classifiedInfoList li');
        listItems.forEach((li) => {
          const labelEl = li.querySelector('strong');
          const valueEl = li.querySelector('span');
          const label = labelEl ? labelEl.textContent?.trim() : '';
          const value = valueEl ? valueEl.textContent?.trim() : '';
          if (label && value) {
            if (label.includes('m²')) result.features.m2 = value;
            if (label.includes('Oda Sayısı')) result.features.rooms = value;
            if (label.includes('Bulunduğu Kat')) result.features.floor = value;
            if (label.includes('Bina Yaşı')) result.features.buildingAge = value;
          }
        });

        const locParts: string[] = [];
        document.querySelectorAll('div.classifiedInfo > h2 > a').forEach((a) => {
          if (a.textContent) locParts.push(a.textContent.trim());
        });
        if (locParts.length > 0) result.location = locParts.join(' / ');

      } else if (url.includes('emlakjet.com')) {
        // Robust Emlakjet Selectors (Text based)
        
        // Price: Look for elements containing 'TL' with specific styling or position
        // Usually h1 or nearby divs
        const allDivs = Array.from(document.querySelectorAll('div'));
        const priceDiv = allDivs.find(el => el.textContent?.includes('TL') && el.textContent.length < 30 && (el.className.includes('price') || getComputedStyle(el).fontSize > '20px'));
        if (priceDiv) result.price = priceDiv.textContent?.trim();

        // Location: Often in h2 or specific info blocks
        // Fallback: Look for text that looks like "District / City"
        const locationDiv = allDivs.find(el => el.className.includes('location') || el.className.includes('address'));
        if (locationDiv) result.location = locationDiv.textContent?.trim();

        // Features: Grid layout
        const featureDivs = document.querySelectorAll('div');
        featureDivs.forEach((div) => {
          const text = div.textContent?.trim();
          if (!text) return;
          
          // Emlakjet often has Label \n Value structure
          if (text === 'm² (Brüt)' || text === 'Brüt Metrekare') result.features.m2 = div.nextElementSibling?.textContent?.trim();
          if (text === 'Oda Sayısı') result.features.rooms = div.nextElementSibling?.textContent?.trim();
          if (text === 'Bulunduğu Kat') result.features.floor = div.nextElementSibling?.textContent?.trim();
          if (text === 'Bina Yaşı') result.features.buildingAge = div.nextElementSibling?.textContent?.trim();
        });

      } else if (url.includes('hepsiemlak.com')) {
        // Price
        const priceVal = document.querySelector('.price-val') || document.querySelector('.price');
        if (priceVal) result.price = priceVal.textContent?.trim();
        
        // Location
        const locationEl = document.querySelector('.location') || document.querySelector('.address');
        if (locationEl) result.location = locationEl.textContent?.trim();

        // Features - usually in a list
        const listItems = document.querySelectorAll('ul li, .spec-item');
        listItems.forEach((li) => {
          const text = li.textContent?.trim() || '';
          
          if (text.includes('m²') || text.includes('Metrekare')) result.features.m2 = text.replace('m²', '').replace('Metrekare', '').trim();
          if (text.includes('Oda')) result.features.rooms = text.replace('Oda Sayısı', '').trim();
          if (text.includes('Kat') && !text.includes('Kategori')) result.features.floor = text.replace('Bulunduğu Kat', '').trim();
          if (text.includes('Yaş') || text.includes('Yaşı')) result.features.buildingAge = text.replace('Bina Yaşı', '').trim();
        });
        
        // Description
        const descEl = document.querySelector('#description') || document.querySelector('.description');
        if (descEl) result.description = descEl.textContent?.trim();
      }

      return result;
    }, url);

    // Debug: Log data to file
    const fs = require('fs');
    fs.writeFileSync('scraper_logs.txt', JSON.stringify(data, null, 2));

    return data;

  } catch (error: any) {
    console.error('Puppeteer Scraping Error:', error);
    const fs = require('fs');
    fs.writeFileSync('scraper_error.txt', error.message);
    throw new Error(`Failed to scrape URL with Puppeteer: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
};
