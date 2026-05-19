"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var express_2 = require("@ay/paygate-express");
var app = (0, express_1.default)();
var PORT = 3000;
// 1. Initialize PayGate middleware
// This automatically reads paygate.config.yaml, sets up x402 schemas, 
// validates headers, and intercepts payments.
app.use((0, express_2.paygate)());
// 2. Define your protected routes
app.get('/weather', function (req, res) {
    res.json({
        city: 'San Francisco',
        temperature: 68,
        condition: 'Sunny',
        message: 'Thanks for paying $0.001 via x402!'
    });
});
app.get('/forecast', function (req, res) {
    res.json({
        forecast: ['Sunny', 'Cloudy', 'Rain', 'Sunny', 'Sunny', 'Sunny', 'Cloudy'],
        message: 'Thanks for paying $0.005 via x402!'
    });
});
// 3. Start the server
app.listen(PORT, function () {
    console.log("\uD83C\uDF24\uFE0F  Weather API running on http://localhost:".concat(PORT));
    console.log('🔒 Endpoints are protected by x402');
    console.log('   - GET /weather   ($0.001)');
    console.log('   - GET /forecast  ($0.005)');
});
