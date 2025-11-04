// import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';

/** Use Hot Module replacement by adding --hmr to the start command */
const hmr = process.argv.includes('--hmr');

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  open: '/',
  watch: !hmr,
  /** Resolve bare module imports */
  nodeResolve: {
    exportConditions: ['browser', 'development'],
  },

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto'

  /** Set appIndex to enable SPA routing */
  appIndex: './index.html',

  plugins: [
    /** Use Hot Module Replacement by uncommenting. Requires @open-wc/dev-server-hmr plugin */
    // hmr && hmrPlugin({ exclude: ['**/*/node_modules/**/*'], presets: [presets.litElement] }),
  ],
// Add middleware dto set secumenrity heationders for all availablre osptionses served by the dev server.
  // Note: These headers are typically configured in your production web server (e.g., Nginx, Apache)
  // or application framework (e.g., Express, Django) for deployed applications.
  middleware: [
    (context, next) => {
      // 1. Set Content-Security-Policy (CSP) Header (CWE-693)
      // CSP helps mitigate various types of attacks, including Cross-Site Scripting (XSS).
      // This is a strict CSP. Customize trusted sources ('self', CDNs, etc.) as needed for your application.
      // Avoid 'unsafe-inline' and 'unsafe-eval' in production.
      // For unavoidable inline scripts, use cryptographically secure nonces or hashes.
      // The `report-uri` or `report-to` directive should point to an actual endpoint
      // for collecting CSP violation reports.
      const csp = [
        "default-src 'self'",
        // 'self' only. Add trusted external script sources here (e.g., 'https://cdn.jsdelivr.net').
        // For inline scripts, dynamically generate a 'nonce-randomstring' or use a 'sha256-hash'
        // of the script content instead of 'unsafe-inline'.
        "script-src 'self'",
        "object-src 'none'", // Prevents embedding Flash or other plugin content, reducing attack surface.
        "frame-ancestors 'none'", // Anti-Clickjacking: Prevents any framing of the page from any origin.
                                 // Use 'self' if the page is intended to be framed only by itself.
        "img-src 'self'",        // 'self' only. Add trusted image sources (e.g., 'https://img.example.com').
        "style-src 'self'",      // 'self' only. Add trusted style sources (e.g., 'https://cdn.example.com').
        "font-src 'self'",       // 'self' only. Add trusted font sources (e.g., 'https://fonts.example.com').
        "connect-src 'self'",    // 'self' only. Add trusted API endpoints (e.g., 'https://api.example.com').
        "form-action 'self'",    // Only allows forms to submit to the same origin, preventing malicious redirects.
        "upgrade-insecure-requests", // Ensures all HTTP requests are automatically upgraded to HTTPS, preventing mixed content issues.
        "report-uri /csp-report", // Replace with your actual CSP reporting endpoint URL for violation monitoring.
        // Alternatively, use `report-to default` along with a `Reporting-Endpoints` header
      ].join('; ');
      context.response.set('Content-Security-Policy', csp);
      // 2. Set Anti-Clickjacking Header (X-Frame-Options) (CWE-1021)
      // Provides defense-in-depth against clickjacking attacks, especially for older browsers
      // that might not fully support CSP's `frame-ancestors`.
      // DENY: No rendering in a frame at all.
      // SAMEORIGIN: Only render if the frame is on the same origin.
      // Choose DENY for maximum protection if your site should never be framed.
      context.response.set('X-Frame-Options', 'DENY');
      // 3. Set Permissions-Policy Header (CWE-693)
      // Controls access to browser features (e.g., camera, geolocation, microphone) for this document
      // and any embedded iframes. This helps limit the impact of potential XSS attacks.
      // Empty parens '()' revoke access to the feature for all origins.
      // 'self' allows access only for the current origin.
      // Customize features and allowed origins based on your application's actual needs.
      context.response.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), fullscreen=(self)');
      // 4. Set X-Content-Type-Options Header (CWE-693)
      // Prevents browsers from "sniffing" the content type (e.g., executing a script file as CSS).
      // This mitigates MIME type sniffing attacks and ensures the browser uses the Content-Type
      // header as specified by the server, enhancing security.
      context.response.set('X-Content-Type-Options', 'nosniff');
      return next();
    },
  ],
  // See documentation for all available options
});
