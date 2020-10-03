const { serveHTTP } = require("stremio-addon-sdk");

const addonInterface = require("./index");
serveHTTP(addonInterface, { port: 7020 });