// this is a bit of a premature abstraction but at some point
// add structured logs, a library, or even just a JSON
const log = (method, message, context) => {
  if (context) {
    console[method](message, context);
  } else {
    console[method](message);
  }
};

module.exports = {
  error: (msg, ctx) => log('error', msg, ctx),
  warn: (msg, ctx) => log('warn', msg, ctx),
  info: (msg, ctx) => log('info', msg, ctx)
};