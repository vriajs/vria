function debug(msg, ...rest) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`VRIA Debug:`, msg, ...rest);
  }
}

function warn(msg) {
  console.warn(`VRIA Warning: ${msg}`);
}

function error(msg, ...rest) {
  console.error(`VRIA Error: ${msg}`, ...rest);
  throw new Error(`VRIA Error: ${msg}`, msg);
}

function mode() {
  if (process.env.NODE_ENV === 'development') {
    console.log(`VRIA in development mode...`);
  }
}

export default {
  debug,
  warn,
  error,
  mode
};
