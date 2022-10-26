var request = require('request');
// Meli payamak
module.exports = (phone, text) => {
    var options = {
        method: 'POST',
        url: 'https://rest.payamak-panel.com/api/SendSMS/SendSMS',
        headers: {
            // 'Content-Type': 'application/json',
            // 'X-API-KEY': 'dec2b2aa-2cb5-47f4-8584-963dc313f363',
            // 'X-SANDBOX': 0,
        },
        body: {
            username: '09336448037',
            password: '2240@fdmxFDMX',
            to: phone,
            from: '50004001448037',
            text: text,
            isFlash: false,
        },
        json: true,
    };
    request(options, function(error, response, body) {
        if (error) console.log(error);
        console.log(body);
    });
}




