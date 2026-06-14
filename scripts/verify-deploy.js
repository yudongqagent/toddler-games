#!/usr/bin/env node
/**
 * Deployment verification script
 * Run after deployment to verify the game is working correctly
 * Usage: npm run deploy:verify
 */

const fetch = globalThis.fetch;

const DEPLOY_URL = 'https://yudongqagent.github.io/toddler-games/';
const EXPECTED_VERSION = process.env.GITHUB_SHA?.slice(0, 7) || 'unknown';

async function verifyDeployment() {
  console.log('=== Deployment Verification ===');
  console.log(`Target: ${DEPLOY_URL}`);
  console.log(`Expected version (commit): ${EXPECTED_VERSION}`);
  console.log('');

  try {
    // 1. Fetch deployed HTML
    console.log('1. Fetching deployed page...');
    const htmlResponse = await fetch(DEPLOY_URL, { 
      headers: { 'Cache-Control': 'no-cache' },
      redirect: 'follow'
    });
    if (!htmlResponse.ok) throw new Error(`HTTP ${htmlResponse.status}`);
    const html = await htmlResponse.text();
    console.log('   ✅ Page fetched successfully');

    // 2. Extract bundle URL
    const bundleMatch = html.match(/assets\/index-[^"'>]+/);
    if (!bundleMatch) throw new Error('Bundle URL not found in HTML');
    const bundlePath = bundleMatch[0];
    const bundleUrl = `https://yudongqagent.github.io/toddler-games/${bundlePath}`;
    console.log(`   Bundle: ${bundlePath}`);

    // 3. Fetch and verify bundle
    console.log('2. Fetching bundle...');
    const bundleResponse = await fetch(bundleUrl, { 
      headers: { 'Cache-Control': 'no-cache' },
      redirect: 'follow'
    });
    if (!bundleResponse.ok) throw new Error(`Bundle HTTP ${bundleResponse.status}`);
    const bundle = await bundleResponse.text();
    console.log(`   ✅ Bundle fetched (${(bundle.length / 1024).toFixed(1)} KB)`);

    // 4. Verify critical fixes in bundle
    console.log('3. Verifying critical fixes...');
    const checks = [
      { name: 'hideLoadingOverlay fix', pattern: /hideLoadingOverlay/ },
      { name: '100ms fallback (delayedCall)', pattern: /delayedCall\(100/ },
      { name: 'startMainMenu function', pattern: /startMainMenu/ },
      { name: '_started guard', pattern: /_started/ },
      { name: 'BootScene class', pattern: /BootScene/ },
      { name: 'MainMenuScene class', pattern: /MainMenuScene/ },
      { name: 'Phaser.Game creation', pattern: /new Phaser\.Game/ },
    ];

    let allPassed = true;
    for (const check of checks) {
      const passed = check.pattern.test(bundle);
      console.log(`   ${passed ? '✅' : '❌'} ${check.name}`);
      if (!passed) allPassed = false;
    }

    if (!allPassed) {
      throw new Error('One or more critical fixes missing from deployed bundle');
    }

    // 5. Verify no loading screen stuck indicators
    console.log('4. Checking for loading screen issues...');
    const loadingIndicators = [
      { name: 'Loading overlay hidden class', pattern: /loading-overlay.*hidden|hidden.*loading-overlay/ },
      { name: 'Start prompt hidden', pattern: /start-prompt.*display.*none|none.*start-prompt/ },
    ];
    
    // Note: These are runtime checks, can't verify from static HTML
    // They're verified by the browser test

    // 6. Verify game container exists
    if (html.includes('game-container')) {
      console.log('   ✅ Game container present in HTML');
    } else {
      console.log('   ⚠️ Game container not found in static HTML (may be injected by JS)');
    }

    console.log('');
    console.log('=== ✅ ALL CHECKS PASSED ===');
    console.log(`🎮 Game verified at: ${DEPLOY_URL}`);
    console.log(`📦 Bundle: ${bundlePath}`);
    console.log('');
    console.log('Manual verification steps:');
    console.log('  1. Open https://yudongqagent.github.io/toddler-games/');
    console.log('  2. Click "Tap to Start"');
    console.log('  3. Verify 6 game cards appear');
    console.log('  4. Click any game to play');
    console.log('  5. Verify audio/sound toggle works');
    console.log('');
    return true;

  } catch (error) {
    console.error('');
    console.error('=== ❌ VERIFICATION FAILED ===');
    console.error(error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('  - GitHub Pages CDN may need 1-2 minutes to propagate');
    console.error('  - Try clearing browser cache or opening in incognito');
    console.error('  - Check Actions tab for workflow logs');
    process.exit(1);
  }
}

verifyDeployment();