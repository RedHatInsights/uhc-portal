#!/usr/bin/env node
/**
 * URL Checker Script
 *
 * This script checks URLs for availability and reports their HTTP status.
 * It detects broken links, redirects, and other HTTP issues.
 *
 * Features:
 * - Checks standard URLs using HEAD requests
 * - Reports HTTP status codes (2xx, 3xx, 4xx, 5xx)
 * - Tests redirect destinations
 * - Color-coded output for easy identification of issues
 * - Multiple output modes (default, verbose, redirects-only)
 */
import fs from 'fs';
import fetch from 'node-fetch';
import ProgressBar from 'progress';

import { getAllExternalLinks } from '../src/common/urlUtils.mjs';

// ======================================================================
// CONFIGURATION
// ======================================================================

// Command-line arguments processing
const args = process.argv.slice(2);
const verboseMode = args.includes('-v') || args.includes('--verbose');
const helpMode = args.includes('-h') || args.includes('--help');
const redirectsMode = args.includes('-r') || args.includes('--redirects');

// Constants
const LINE_LENGTH = 80;
const COLOR = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RESET: '\x1b[0m',
};

// ======================================================================
// HELP INFORMATION
// ======================================================================

/**
 * Displays help information
 */
function displayHelp() {
  console.log(`
URL Checker (check-links.mjs)
=============================

Description:
  This script checks a list of URLs for availability and reports their HTTP status.
  It detects broken links, redirects, and other HTTP issues.

Usage:
  node check-links.mjs [options]

Options:
  -h, --help     Show this help message and exit
  -v, --verbose  Show detailed URL listings for all categories
                 (By default, only error URLs are displayed)
  -r, --redirects Show ONLY redirected URLs with their redirect targets

Output:
  The script categorizes URLs by their HTTP status:
  - Success (200 OK)
  - Redirects (3xx)
  - Client errors (4xx)
  - Server errors (5xx)
  - Other errors (network issues, timeouts, etc.)

  Client errors, server errors, and request errors are always displayed in detail.

HTTP Status Codes:
  The script recognizes and reports on the following HTTP status codes:

  Success (2xx):
    200 - OK (Request succeeded)
    201 - Created (New resource created)
    204 - No Content (Success with no body)

  Redirects (3xx):
    301 - Moved Permanently (Resource at new location)
    302 - Found (Resource temporarily at different URL)
    303 - See Other (Response at another URI)
    307 - Temporary Redirect (Resource temporarily moved)
    308 - Permanent Redirect (Resource permanently moved)

  Client Errors (4xx):
    400 - Bad Request (Client error in request)
    401 - Unauthorized (Authentication required)
    403 - Forbidden (Server refuses authorization)
    404 - Not Found (Resource not found)
    405 - Method Not Allowed (Request method not supported)
    408 - Request Timeout (Server timeout)
    429 - Too Many Requests (Rate limit exceeded)

  Server Errors (5xx):
    500 - Internal Server Error (Server error)
    501 - Not Implemented (Function not supported)
    502 - Bad Gateway (Invalid response from upstream)
    503 - Service Unavailable (Server temporarily unavailable)
    504 - Gateway Timeout (Upstream server timeout)
  `);
}

if (helpMode) {
  displayHelp();
  process.exit(0);
}

// ======================================================================
// UTILITY FUNCTIONS
// ======================================================================

/**
 * Returns a human-readable description for HTTP status codes
 * @param {number} statusCode - The HTTP status code
 * @returns {string} Human-readable description
 */
function getStatusCodeDescription(statusCode) {
  const descriptions = {
    // 2xx - Success
    200: 'OK (Request succeeded)',
    201: 'Created (New resource created)',
    204: 'No Content (Success with no body)',

    // 3xx - Redirects
    301: 'Moved Permanently (Resource at new location)',
    302: 'Found (Resource temporarily at different URL)',
    303: 'See Other (Response at another URI)',
    307: 'Temporary Redirect (Resource temporarily moved)',
    308: 'Permanent Redirect (Resource permanently moved)',

    // 4xx - Client Errors
    400: 'Bad Request (Client error in request)',
    401: 'Unauthorized (Authentication required)',
    403: 'Forbidden (Server refuses authorization)',
    404: 'Not Found (Resource not found)',
    405: 'Method Not Allowed (Request method not supported)',
    408: 'Request Timeout (Server timeout)',
    429: 'Too Many Requests (Rate limit exceeded)',

    // 5xx - Server Errors
    500: 'Internal Server Error (Server error)',
    501: 'Not Implemented (Function not supported)',
    502: 'Bad Gateway (Invalid response from upstream)',
    503: 'Service Unavailable (Server temporarily unavailable)',
    504: 'Gateway Timeout (Upstream server timeout)',
  };

  return descriptions[statusCode] || 'Unknown Status';
}

/**
 * Gets color-coded status text based on HTTP status code
 * @param {number|string} status - The HTTP status code or error message
 * @returns {string} Color-coded status text
 */
function getColorCodedStatus(status) {
  // If status is a string (error message), return in red
  if (typeof status === 'string') {
    return `${COLOR.RED}${status}${COLOR.RESET}`;
  }

  // Color code based on status code range
  if (status >= 200 && status < 300) {
    return `${COLOR.GREEN}${status}${COLOR.RESET}`; // Green for success
  }
  if (status >= 300 && status < 400) {
    return `${COLOR.YELLOW}${status}${COLOR.RESET}`; // Yellow for redirects
  }
  if (status >= 400) {
    return `${COLOR.RED}${status}${COLOR.RESET}`; // Red for client/server errors
  }

  return status.toString(); // Default case
}

/**
 * Prints a section header with a right-aligned count
 * @param {string} title - Section title
 * @param {number} count - Count of items
 */
function printHeader(title, count) {
  const countStr = `${count} URLs`;
  const padding = Math.max(0, LINE_LENGTH - title.length - countStr.length);
  console.log(`\n${title}${' '.repeat(padding)}${countStr}`);
}

/**
 * Creates a color-coded count string
 * @param {number} count - The count to display
 * @param {boolean} useRed - Whether to use red for non-zero values
 * @returns {string} Formatted count string
 */
function formatCount(count, useRed = false) {
  const countStr = count.toString().padStart(6);
  if (useRed && count > 0) {
    return `${COLOR.RED}${countStr}${COLOR.RESET}`;
  }
  return countStr;
}

/**
 * Categorizes URL results into different types
 * @param {Object} results - URL checking results
 * @returns {Object} Categorized results
 */
function categorizeResults(results) {
  const success = [];
  const redirects = [];
  const clientErrors = [];
  const serverErrors = [];
  const errors = [];
  const skipped = [];

  Object.keys(results).forEach((url) => {
    const result = results[url];

    if (result === 'not checked') {
      skipped.push({ url, status: 'skipped' });
    } else if (typeof result === 'number') {
      if (result === 200) {
        success.push({ url, status: result });
      } else if (result >= 300 && result < 400) {
        redirects.push({ url, status: result });
      } else if (result >= 400 && result < 500) {
        clientErrors.push({ url, status: result });
      } else if (result >= 500) {
        serverErrors.push({ url, status: result });
      }
    } else if (typeof result === 'string') {
      if (result.includes('->')) {
        // Handle redirect strings like "301 -> https://example.com"
        const parts = result.split('->');
        const status = parseInt(parts[0].trim(), 10);
        const location = parts[1].trim();
        redirects.push({
          url,
          status,
          redirectUrl: location,
        });
      } else {
        // This is likely an error message
        errors.push({
          url,
          error: true,
          errorMessage: result,
        });
      }
    }
  });

  return { success, redirects, clientErrors, serverErrors, errors, skipped };
}

/**
 * Fetches a URL with HEAD method, falling back to GET if HEAD returns 405
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options (e.g., redirect: 'manual')
 * @returns {Promise<Response>} The fetch response
 */
async function fetchWithFallback(url, options = {}) {
  try {
    const headResponse = await fetch(url, { ...options, method: 'HEAD' });
    // If HEAD returns 405 (Method Not Allowed), try GET instead
    if (headResponse.status === 405) {
      return await fetch(url, { ...options, method: 'GET' });
    }
    return headResponse;
  } catch (e) {
    // If HEAD fails with an error, try GET as fallback
    try {
      return await fetch(url, { ...options, method: 'GET' });
    } catch (getError) {
      // If both fail, throw the original error
      throw e;
    }
  }
}

/**
 * Tests redirect URLs to check their final status
 * @param {Object} statusByUrl - Status results by URL
 * @returns {Promise<Array>} Results of redirect tests
 */
async function testRedirectUrls(statusByUrl) {
  const redirectItems = [];

  // Identify redirect URLs
  Object.keys(statusByUrl).forEach((url) => {
    const result = statusByUrl[url];
    if (typeof result === 'string' && result.includes('->')) {
      const parts = result.split('->');
      const status = parseInt(parts[0].trim(), 10);
      const redirectUrl = parts[1].trim();
      redirectItems.push({
        originalUrl: url,
        redirectUrl,
        status,
        finalStatus: null,
        error: null,
      });
    }
  });

  if (redirectItems.length === 0) {
    return redirectItems;
  }

  // Test redirect destinations
  console.log('\nTesting redirect destinations...');

  // Create a progress bar for redirect testing
  const testBar = new ProgressBar(':bar :current/:total redirect URLs tested (:percent)', {
    total: redirectItems.length,
    width: 30,
    complete: '█',
    incomplete: '░',
    clear: true,
  });

  // Test each redirect URL
  await Promise.all(
    redirectItems.map(async (item) => {
      try {
        const { status: finalStatus } = await fetchWithFallback(item.redirectUrl);
        // If we got 200 with GET after 405 with HEAD, treat it as success
        const newItem = { ...item, finalStatus };
        // Use Object.assign to update the original item for progress tracking
        Object.assign(item, newItem);
      } catch (e) {
        const newItem = { ...item, error: e.toString() };
        // Use Object.assign to update the original item for progress tracking
        Object.assign(item, newItem);
      }
      testBar.tick();
    }),
  );

  return redirectItems;
}

/**
 * Displays a redirect status group
 * @param {string} status - HTTP status code
 * @param {Array} items - Redirect items
 * @param {Object} redirectTestMap - Map of redirect test results
 * @param {boolean} verbose - Whether to show verbose output
 */
function displayRedirectStatusGroup(status, items, redirectTestMap, verbose) {
  const description = getStatusCodeDescription(parseInt(status, 10));
  const statusTitle = `[Status ${status} - ${description}]`;
  const countStr = `${items.length} URLs`;
  const targetColumn = LINE_LENGTH - countStr.length;
  const padding = Math.max(1, targetColumn - statusTitle.length - 3);

  console.log();
  console.log(`${statusTitle} - ${' '.repeat(padding)}${countStr}`);
  console.log();

  // Classify test results
  const successfulTests = [];
  const failedTests = [];

  // Sort items into successful and failed tests
  items.forEach((r) => {
    const testResult = redirectTestMap[r.url];

    if (testResult && testResult.error) {
      failedTests.push({ ...r, testResult });
    } else if (testResult && testResult.finalStatus) {
      const { finalStatus } = testResult;
      if (finalStatus >= 200 && finalStatus < 300) {
        successfulTests.push({ ...r, testResult });
      } else {
        failedTests.push({ ...r, testResult });
      }
    } else {
      // No test result available
      failedTests.push({ ...r, testResult: { error: 'No test result available' } });
    }
  });

  // Always display success and error summaries
  if (successfulTests.length > 0) {
    console.log(
      `  ${COLOR.GREEN}✓ ${successfulTests.length} redirect URLs tested successfully${COLOR.RESET}`,
    );
  }

  if (failedTests.length > 0) {
    console.log(`  ${COLOR.RED}X ${failedTests.length} redirect URLs had errors${COLOR.RESET}`);
    console.log();

    // Display the failed URLs
    failedTests.forEach((r) => {
      console.log(`  [Original URL] ${r.url}`);
      if (r.redirectUrl) {
        console.log(`  [Redirect URL] ${r.redirectUrl}`);

        // Show test result details
        if (r.testResult.error) {
          console.log(
            `  [Redirect URL Test] ${COLOR.RED}${r.testResult.error.substring(0, 60)}${COLOR.RESET}`,
          );
        } else if (r.testResult.finalStatus) {
          let statusText;
          const testStatus = r.testResult.finalStatus;
          if (testStatus >= 300 && testStatus < 400) {
            statusText = `${COLOR.YELLOW}${testStatus}${COLOR.RESET}`;
          } else {
            statusText = `${COLOR.RED}${testStatus}${COLOR.RESET}`;
          }
          console.log(`  [Redirect URL Test] ${statusText}`);
        }
      }
      console.log();
    });
  } else if (successfulTests.length > 0) {
    // Add a line break after successful tests summary if there are no failed tests
    console.log();
  }

  // In verbose mode, also display successful URLs if requested
  if (verbose && successfulTests.length > 0) {
    console.log('  Successful redirect details:');
    console.log();

    successfulTests.forEach((r) => {
      console.log(`  [Original URL] ${r.url}`);
      if (r.redirectUrl) {
        console.log(`  [Redirect URL] ${r.redirectUrl}`);

        // Show test result details
        if (r.testResult.finalStatus) {
          const testStatus = r.testResult.finalStatus;
          // Use getColorCodedStatus to fix "defined but never used" error
          console.log(`  [Redirect URL Test] ${getColorCodedStatus(testStatus)}`);
        }
      }
      console.log();
    });
  }
}

/**
 * Displays redirects only (for redirects mode)
 * @param {Array} redirects - Redirect URLs
 * @param {Object} redirectTestMap - Map of redirect test results
 */
function displayRedirectsOnly(redirects, redirectTestMap) {
  if (redirects.length === 0) {
    console.log('\nNo redirects found');
    return;
  }

  // Group by status code
  const redirectsByStatus = {};
  redirects.forEach((r) => {
    const { status } = r;
    if (!redirectsByStatus[status]) {
      redirectsByStatus[status] = [];
    }
    redirectsByStatus[status].push(r);
  });

  // Sort status codes numerically
  const sortedStatusCodes = Object.keys(redirectsByStatus).sort(
    (a, b) => parseInt(a, 10) - parseInt(b, 10),
  );

  // Print each status group
  sortedStatusCodes.forEach((status) => {
    const items = redirectsByStatus[status];
    displayRedirectStatusGroup(status, items, redirectTestMap, true);
  });
}

/**
 * Displays redirects section with test results
 * @param {Array} redirects - Redirect URLs
 * @param {Object} redirectTestMap - Map of redirect test results
 * @param {boolean} verbose - Whether to show verbose output
 */
function displayRedirectsSection(redirects, redirectTestMap, verbose) {
  printHeader('REDIRECTS:', redirects.length);

  if (redirects.length === 0) {
    console.log('No redirects found');
    return;
  }

  // Group by status code
  const redirectsByStatus = {};
  redirects.forEach((r) => {
    const { status } = r;
    if (!redirectsByStatus[status]) {
      redirectsByStatus[status] = [];
    }
    redirectsByStatus[status].push(r);
  });

  // Sort status codes numerically
  const sortedStatusCodes = Object.keys(redirectsByStatus).sort(
    (a, b) => parseInt(a, 10) - parseInt(b, 10),
  );

  // Print each status group
  sortedStatusCodes.forEach((status) => {
    const items = redirectsByStatus[status];
    displayRedirectStatusGroup(status, items, redirectTestMap, verbose);
  });
}

/**
 * Displays error section (client or server errors)
 * @param {string} title - Section title
 * @param {Array} errorItems - Error items
 */
function displayErrorSection(title, errorItems) {
  printHeader(title, errorItems.length);

  if (errorItems.length === 0) {
    console.log(`No ${title.toLowerCase().replace(':', '')} found`);
    return;
  }

  // Group by status code
  const errorsByStatus = {};
  errorItems.forEach((r) => {
    const { status } = r;
    if (!errorsByStatus[status]) {
      errorsByStatus[status] = [];
    }
    errorsByStatus[status].push(r);
  });

  // Sort status codes numerically
  const sortedStatusCodes = Object.keys(errorsByStatus).sort(
    (a, b) => parseInt(a, 10) - parseInt(b, 10),
  );

  // Print each status group
  sortedStatusCodes.forEach((status) => {
    const items = errorsByStatus[status];
    const description = getStatusCodeDescription(parseInt(status, 10));
    // Color just the status code in red, not the entire title
    const statusTitle = `[Status ${COLOR.RED}${status}${COLOR.RESET} - ${description}]`;
    const countStr = `${items.length} URLs`;
    const targetColumn = LINE_LENGTH - countStr.length;
    const padding = Math.max(1, targetColumn - statusTitle.length - 3);

    console.log();
    console.log(`${statusTitle} - ${' '.repeat(padding)}${countStr}`);
    console.log();

    if (items.length > 0) {
      items.forEach((r) => {
        // Print each URL with a red status code
        console.log(`  [Original URL] ${r.url}`);
        console.log();
      });
    }
  });
}

/**
 * Displays request error section
 * @param {Array} errors - Error items
 */
function displayRequestErrorsSection(errors) {
  printHeader('REQUEST ERRORS:', errors.length);

  if (errors.length === 0) {
    console.log('No request errors found');
    return;
  }

  // Group errors by first word of error message (rough error type)
  const errorsByType = {};
  errors.forEach((r) => {
    const errorType = r.errorMessage.split(' ')[0].replace(':', '');
    if (!errorsByType[errorType]) {
      errorsByType[errorType] = [];
    }
    errorsByType[errorType].push(r);
  });

  // Print each error type group
  Object.entries(errorsByType).forEach(([errorType, items]) => {
    const typeTitle = `[${errorType}]`;
    const countStr = `${items.length} URLs`;
    const targetColumn = LINE_LENGTH - countStr.length;
    const padding = Math.max(1, targetColumn - typeTitle.length - 3);

    console.log();
    console.log(`${typeTitle} - ${' '.repeat(padding)}${countStr}`);
    console.log();

    if (items.length > 0) {
      items.forEach((r) => {
        console.log(`  [Original URL] ${r.url}`);
        console.log(`  [Error] ${r.errorMessage}`);
        console.log();
      });
    }
  });
}

/**
 * Displays skipped URLs section
 * @param {Array} skipped - Skipped items
 * @param {boolean} verbose - Whether to show verbose output
 */
function displaySkippedSection(skipped, verbose) {
  printHeader('SKIPPED:', skipped.length);

  if (skipped.length === 0) {
    console.log('No URLs were skipped');
    return;
  }

  if (verbose) {
    skipped.forEach((r) => {
      console.log(`  [Original URL] ${r.url}`);
      console.log();
    });
  } else {
    console.log('URLs that were skipped (e.g., mailto: links)');
  }
}

/**
 * Displays grand total of URLs
 * @param {number} grandTotal - Total URLs
 */
function displayGrandTotal(grandTotal) {
  console.log(`\n${'-'.repeat(LINE_LENGTH)}`);
  const grandTotalTitle = 'Total URLs checked:';
  const grandCountStr = `${grandTotal} URLs`;
  const grandPadding = Math.max(0, LINE_LENGTH - grandTotalTitle.length - grandCountStr.length);
  console.log(`${grandTotalTitle}${' '.repeat(grandPadding)}${grandCountStr}`);
  console.log('-'.repeat(LINE_LENGTH));
}

/**
 * Displays usage notes
 * @param {boolean} verbose - Whether in verbose mode
 */
function displayUsageNotes(verbose) {
  if (!verbose) {
    console.log(
      '\nNote: Run with -v or --verbose to see URLs for successful requests and redirects',
    );
    console.log('      Run with -r or --redirects to see ONLY redirected URLs with targets');
    console.log('      Run with -h or --help for more information');
  } else {
    console.log('\nNote: Run with -r or --redirects to see ONLY redirected URLs with targets');
    console.log('      Run with -h or --help for more information');
  }
}

/**
 * Displays the summary table of results
 * @param {Object} categories - Categorized results
 * @param {number} totalChecked - Total checked URLs
 * @param {number} redirectErrorCount - Count of redirect errors
 */
function displaySummaryTable(categories, totalChecked, redirectErrorCount) {
  const { success, redirects, clientErrors, serverErrors, errors, skipped } = categories;

  console.log('\nURL CHECK RESULTS');
  console.log();

  console.log('Category                           Count');
  console.log('---------------------------------- ------');
  console.log(`Total URLs skipped                ${formatCount(skipped.length)}`);
  console.log(`Success                           ${formatCount(success.length)}`);
  console.log(`Redirects                         ${formatCount(redirects.length)}`);
  console.log(`Redirects errors                  ${formatCount(redirectErrorCount, true)}`);
  console.log(`Client errors (4xx)               ${formatCount(clientErrors.length, true)}`);
  console.log(`Server errors (5xx)               ${formatCount(serverErrors.length, true)}`);
  console.log(`Request errors                    ${formatCount(errors.length, true)}`);
  console.log('---------------------------------- ------');
  console.log(`Total URLs checked                ${formatCount(totalChecked)}`);
}

/**
 * Displays the success section
 * @param {Array} success - Successful URLs
 * @param {boolean} verbose - Whether to show verbose output
 */
function displaySuccessSection(success, verbose) {
  printHeader('SUCCESS:', success.length);

  if (success.length > 0) {
    console.log(`All these URLs returned status code 200 (OK)`);
    if (verbose) {
      success.forEach((r) => {
        console.log(`  [Original URL] ${r.url}`);
        console.log();
      });
    }
  } else {
    console.log('No successful URLs found');
  }
}

/**
 * Displays results of URL checking
 * @param {Object} results - URL checking results
 * @param {Array} testedRedirects - Results of redirect testing
 * @param {boolean} verbose - Whether to show verbose output
 * @param {boolean} redirectsMode - Whether to only show redirects
 */
function displayResults(results, testedRedirects, verbose = false, redirectsMode = false) {
  // Create lookup map for redirect test results
  const redirectTestMap = {};
  testedRedirects.forEach((item) => {
    redirectTestMap[item.originalUrl] = item;
  });

  // Categorize results
  const categories = categorizeResults(results);
  const { success, redirects, clientErrors, serverErrors, errors, skipped } = categories;

  // In redirects mode, only show redirect information
  if (redirectsMode) {
    displayRedirectsOnly(redirects, redirectTestMap);
    return;
  }

  // Calculate totals
  const totalChecked =
    success.length + redirects.length + clientErrors.length + serverErrors.length + errors.length;
  const grandTotal = totalChecked + skipped.length;

  // Count redirect errors
  let redirectErrorCount = 0;
  testedRedirects.forEach((item) => {
    if (item.error || (item.finalStatus && (item.finalStatus < 200 || item.finalStatus >= 300))) {
      redirectErrorCount += 1;
    }
  });

  // Display summary table
  displaySummaryTable(categories, totalChecked, redirectErrorCount);

  // Display detailed sections
  displaySuccessSection(success, verbose);
  displayRedirectsSection(redirects, redirectTestMap, verbose);
  displayErrorSection('CLIENT ERRORS (4xx):', clientErrors);
  displayErrorSection('SERVER ERRORS (5xx):', serverErrors);
  displayRequestErrorsSection(errors);
  displaySkippedSection(skipped, verbose);

  // Display grand total
  displayGrandTotal(grandTotal);

  // Display usage notes
  displayUsageNotes(verbose);
}

// ======================================================================
// URL PROCESSING FUNCTIONS
// ======================================================================

/**
 * Processes URLs and tests redirects
 */
async function main() {
  console.log('Checking URLs...');

  // Get URLs to check
  const urls = await getAllExternalLinks();
  console.log(`Found ${urls.length} URLs to check`);

  // Create a progress bar
  const bar = new ProgressBar(':bar :current/:total URLs checked (:percent)', {
    total: urls.length,
    width: 30,
    complete: '█',
    incomplete: '░',
    clear: true,
  });

  // Results object
  const statusByUrl = {};

  // Process all URLs in parallel
  await Promise.all(
    urls.map(async (url) => {
      if (url.startsWith('mailto:')) {
        statusByUrl[url] = 'not checked';
      } else {
        try {
          // For permanent redirects, you might want to update the link
          const response = await fetchWithFallback(url, { redirect: 'manual' });
          // If we got 200 with GET after 405 with HEAD, treat it as success
          if (response.status === 200) {
            statusByUrl[url] = 200;
          } else {
            statusByUrl[url] = response.status;
            if (response.status >= 300 && response.status < 400) {
              const locationURL = new URL(response.headers.get('location'), response.url);
              statusByUrl[url] = `${response.status} ->\t${locationURL}`;
            }
          }
        } catch (e) {
          // 3xx-5xx are NOT exceptions, but network errors, etc. are.
          statusByUrl[url] = e.toString();
        }
      }
      bar.tick();
    }),
  );

  // Gather redirect URLs for testing
  const redirectItems = await testRedirectUrls(statusByUrl);

  // Display the results
  displayResults(statusByUrl, redirectItems, verboseMode, redirectsMode);

  const has404 = Object.values(statusByUrl).filter(
    (result) => typeof result === 'number' && result === 404,
  );
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `has404=${has404.length > 0}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `notFoundLength=${has404.length}\n`);
  }
}

// ======================================================================
// SCRIPT EXECUTION
// ======================================================================

// Run the main function and handle errors
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running script:', error);
    process.exit(1);
  });
