var builder = require('botbuilder');
var YQL = require('yql');
var moment = require('moment');

/** Return a LuisDialog that points at our model and then add intent handlers. */
var model = process.env.LUIS_MODEL || 'https://api.projectoxford.ai/luis/v1/application?id=d7381b70-4027-4476-b0e7-fa36423ad19b&subscription-key=612de04505c24e20a0652a64f16f48cb';
var dialog = new builder.LuisDialog(model);
module.exports = dialog;

/**
 * Fetch weather details from Yahoo Weather API
 * @param loc Location to get the weather for
 */
function weatherForecast(loc, cb) {
  const query = new YQL('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + loc + '")');

  query.exec((err, data) => {
    if (err) return cb(err);

    return cb(null, data.query);
  });
}

/**
 * Find forecast for a specified date (if available)
 */
function forecastForADate(forecastDate, forecasts) {
  return forecasts.find((item) => {
    var date = moment(item.date, 'DD MMM YYYY');
    return date.isSame(forecastDate);
  });
}

/** Prompts to get the current weather conditions */
dialog.on('GetCurrentWeather', [
  function(session, args, next) {
    const location = builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city');

    if (!location) {
      builder.Prompts.text(session, 'Where?');
    } else {
      next({
        response: location.entity
      });
    }
  },
  function(session, results) {
    const loc = results.response;

    weatherForecast(loc, (err, data) => {
      var res = data.results.channel.item.condition;
      session.send(res.text + ' with a temperature of ' + res.temp + ' degress');
    });
  }
]);

/** Fetch the weather forecast for a city */
dialog.on('GetForecast', [
  function(session, args, next) {
    const location = builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city');
    const timeperiod = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.date');

    if (!location) {
      builder.Prompts.text(session, 'Where?');
    } else {
      next({
        location: location.entity,
        timeperiod: timeperiod
      });
    }
  },
  function(session, results) {
    const loc = results.location;

    weatherForecast(loc, (err, data) => {
      const res = data.results.channel.item.forecast;

      if (!results.timeperiod) {

        res.forEach((item) => {
          var message = item.day + ': ' + item.text + ' with a high of ' + item.high + ' and a low of ' + item.low;
          session.send(message);
        });

      } else {

        var forecastdate = moment(results.timeperiod.resolution.date, 'YYYY-MM-DD');
        var forecast = forecastForADate(forecastdate, res);

        if (forecast) {
          var msg = forecast.day + ': ' + forecast.text + ' with a high of ' + forecast.high + ' and a low of ' + forecast.low;
          session.send(msg);
        } else {
          var msg = "Whoops, forecast not available yet!";
          session.send(msg);
        }
      }
    });
  }
]);
