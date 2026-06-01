/**
 * Structured logger.
 * Dev:        coloured console output for readability
 * Production: JSON lines — ingested by any log aggregator (Datadog, Logtail, etc.)
 */

const IS_PROD = process.env.NODE_ENV === 'production';

const ANSI = {
  info:  '\x1b[36m',  // cyan
  warn:  '\x1b[33m',  // yellow
  error: '\x1b[31m',  // red
  debug: '\x1b[90m',  // grey
  reset: '\x1b[0m',
};

function write(level, message, meta) {
  if (IS_PROD) {
    // Structured JSON — one line per event, parseable by log aggregators
    const entry = { ts: new Date().toISOString(), level, msg: message };
    if (meta) Object.assign(entry, typeof meta === 'object' ? meta : { detail: meta });
    process.stdout.write(JSON.stringify(entry) + '\n');
  } else {
    const prefix = `${ANSI[level]}[${level.toUpperCase()}]${ANSI.reset}`;
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(prefix, message, meta !== undefined ? meta : '');
  }
}

export const logger = {
  info:  (msg, meta) => write('info',  msg, meta),
  warn:  (msg, meta) => write('warn',  msg, meta),
  error: (msg, meta) => write('error', msg, meta),
  debug: (msg, meta) => { if (!IS_PROD) write('debug', msg, meta); },
};
