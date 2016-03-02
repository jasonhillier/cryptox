"use strict";

var moment = require("moment");
var POLONIEX = require('../../poloniex.js/lib/poloniex.js');

var util = require("./util"); //custom functions

function Poloniex (options) {
	var poloniexPublic, poloniexPrivate;
    var self = this;
    self["options"] = options;

    poloniexPublic = new POLONIEX();
    if (typeof options.key === "string" && typeof options.secret === "string")
        poloniexPrivate = new POLONIEX(options.key, options.secret);
    else
        poloniexPrivate = poloniexPublic;

    self.getRate = function (options, callback) {
        self.getTicker(options, function(err, ticker) {
            var rate, data;
            rate = {
                timestamp: util.timestampNow(),
                error: "",
                data: []
            };
            if (err) {
                rate.error = err.message;
                return callback(err, rate);
            }
            rate.timestamp = ticker.timestamp;
            data = {
                pair: ticker.data[0].pair,
                rate: ticker.data[0].last
            };
            rate.data.push(data);
            callback(err, rate);
        });
    };

    self.getTicker = function (options, callback) {
        var ticker;
        var err = new Error("Method not implemented");
        ticker = {
            timestamp: util.timestampNow(),
            error: err.message,
            data: []
        };
        callback(err, ticker);
    };

    self.getOrderBook = function (options, callback) {
        var orderBook;
        var err = new Error("Method not implemented");
        orderBook = {
            timestamp: util.timestampNow(),
            error: err.message,
            data: []
        };
        callback(err, orderBook);
    };

    self.getTrades = function (options, callback) {
        var trades;
        var err = new Error("Method not implemented");
        trades = {
            timestamp: util.timestampNow(),
            error: err.message,
            data: []
        };
        callback(err, trades);
    };

    self.getFee = function (options, callback) {
        var fee;
        var err = new Error("Method not implemented");
        fee = {
            timestamp: util.timestampNow(),
            error: err.message,
            data: []
        };
        callback(err, fee);
    };

    self.getTransactions = function (options, callback) {
        var transactions;
        var err = new Error("Method not implemented");
        transactions = {
            timestamp: util.timestampNow(),
            error: err.message,
            data: []
        };
        callback(err, transactions);
    };

    self.getBalance = function (options, callback) {
        poloniexPrivate.myAvailableAccountBalances(function (err, xResult) {
            // https://poloniex.com/support/api/
            if (!err) err = xResult.error;

            var tmpAccounts = [];

            var balance = {
                timestamp: util.timestampNow(),
                error: err || "",
                data: tmpAccounts
            };

            if (!err)
            {
                for(var account in xResult)
                {
                    var tmpAccount = {account_id: account, available: []};

                    for(var currency in xResult[account])
                    {
                        tmpAccount.available.push({
                            currency: currency,
                            amount: xResult[account][currency]
                        });
                    }

                    tmpAccounts.push(tmpAccount);
                }
            }

            return callback(err, balance);
        });
    };

    self.getOpenOrders = function (options, callback) {
        var openOrders;
        var err = new Error("Method not implemented");
        openOrders = {
            timestamp: util.timestampNow(),
            error: err.message,
            data: []
        };
        callback(err, openOrders);
    };

    self.postSellOrder = function (options, callback) {
        var orderResult;
        var err = new Error("Method not implemented");
        orderResult = {
            timestamp: util.timestampNow(),
            error: err.message,
            data: []
        };
        callback(err, orderResult);
    };

    self.postBuyOrder = function (options, callback) {
        var orderResult;
        var err = new Error("Method not implemented");
        orderResult = {
            timestamp: util.timestampNow(),
            error: err.message,
            data: []
        };
        callback(err, orderResult);
    };

    self.cancelOrder = function (options, callback) {
        var orderResult;
        var err = new Error("Method not implemented");
        orderResult = {
            timestamp: util.timestampNow(),
            error: err.message,
            data: []
        };
        callback(err, orderResult);
    };

    var lendbook = function (currency, callback) {
		poloniexPublic.getLendBook(currency, function (err, xResult) {
			// https://poloniex.com/support/api/
			if (!err) err = xResult.error;

			var price, volume, lend, result, data;
			result = {
				timestamp: util.timestampNow(),
				error: err || "",
				data: []
			};
			if (err)
				return callback(err, result);
			// require("jsonfile").writeFileSync(__dirname + "/poloniex-getLendBook_MockApiResponse.json", xResult);     // only used to create MockApiResponse file for the test unit
			data = {
				currency: currency.toUpperCase().replace("BTC", "XBT"),
				asks: [],
				bids: []
			};
			result.data.push(data);
			try
			{
				xResult.offers.forEach(function(offer)
				{
					data.asks.push({
						rate: offer.rate * 100 * 365,
						amount: offer.amount,
						period: offer.rangeMin,
						created_at: moment.utc().format(),
						frr: false
					});
				});

				xResult.demands.forEach(function(demand)
				{
					data.bids.push({
						rate: demand.rate * 100 * 365,
						amount: demand.amount,
						period: demand.rangeMin,
						created_at: moment.utc().format(),
						frr: false
					});
				});
			}
			catch(e)
			{
				result.error = e.message;
				return 	callback(e, result);
			}
			return callback(null, result);
		});
	};

	self.getLendBook = function (options, callback) {
		var currency = options.currency.replace("XBT", "BTC");
		lendbook(currency, function (err, result) {
			callback(err, result);
		});
	};

    self.postOffer = function (options, callback) {
        var currency = options.currency.replace("XBT", "BTC");
        poloniexPrivate.createLoanOffer(currency, options.amount, options.period, options.autoRenew, options.rate, function (err, xResult) {
            // https://poloniex.com/support/api/
            if (!err) err = xResult.error;

            var result = {
                timestamp: util.timestampNow(),
                error: err || "",
                data:
                {
                    offerId: xResult.orderID //TODO: definition?
                }
            };

            return callback(err, result);
        });
    };

    self.cancelOffer = function (options, callback) {
        poloniexPrivate.cancelLoanOffer(options.offerId, function (err, xResult) {
            // https://poloniex.com/support/api/
            if (!err) err = xResult.error;

            var result = {
                timestamp: util.timestampNow(),
                error: err || "",
                success: xResult.success
            };

            return callback(err, result);
        });
    };

    self.getActiveOffers = function (options, callback) {
        poloniexPrivate.myOpenLoanOffers(function (err, xResult) {
            // https://poloniex.com/support/api/
            if (!err) err = xResult.error;

            var result = {
                timestamp: util.timestampNow(),
                error: err || ""
            };
            if (err)
                return callback(err);

            var offers = xResult;

            poloniexPrivate.myActiveLoans(function (err, xResult) {
                // https://poloniex.com/support/api/
                if (!err) err = xResult.error;

                var result = {
                    timestamp: util.timestampNow(),
                    error: err || ""
                };
                if (err)
                    return callback(err);

                var loans = xResult;

                result.data = {};
                result.data.offers = offers;
                result.data.loans = loans;

                return callback(null, result);
            });
        });
    };
}

Poloniex.prototype.properties = {
    name: "Poloniex",              // Proper name of the exchange/provider
    slug: "poloniex",               // slug name of the exchange. Needs to be the same as the .js filename
    methods: {
        notImplemented: ["getRate", "getTicker", "getOrderBook", "getTrades", "getFee", "getTransactions",
            "getOpenOrders", "postSellOrder", "postBuyOrder", "cancelOrder"],
        notSupported: []
    },
    instruments: [                  // all allowed currency/asset combinatinos (pairs) that form a market
        {
            pair: "USDBTC"
        },
        {
            pair: "RURBTC"
        },
        {
            pair: "EURBTC"
        },
        {
            pair: "BTCLTC"
        },
        {
            pair: "USDLTC"
        },
        {
            pair: "RURLTC"
        },
        {
            pair: "EURLTC"
        },
        {
            pair: "BTCNMC"
        },
        {
            pair: "USDNMC"
        },
        {
            pair: "BTCNVC"
        },
        {
            pair: "USDNVC"
        },
        {
            pair: "RURUSD"
        },
        {
            pair: "USDEUR"
        },
        {
            pair: "BTCTRC"
        },
        {
            pair: "BTCPPC"
        },
        {
            pair: "USDPPC"
        },
        {
            pair: "BTCFTC"
        },
        {
            pair: "BTCXPM"
        }
    ],
    publicAPI: {
        supported: true,            // is public API (not requireing user authentication) supported by this exchange?
        requires: []                // required parameters
    },
    privateAPI: {
        supported: true,            // is public API (requireing user authentication) supported by this exchange?
        requires: ["key", "secret"]
    },
    marketOrder: false,             // does it support market orders?
    infinityOrder: false,           // does it supports infinity orders?
                                    // (which means that it will accept orders bigger then the current balance and order at the full balance instead)
    monitorError: "",               //if not able to monitor this exchange, please set it to an URL explaining the problem
    tradeError: ""                  //if not able to trade at this exchange, please set it to an URL explaining the problem
};

module.exports = Poloniex;
