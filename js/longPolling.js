/*
 * Long Polling Script using Jquery, with minWaitTime and Validator
 * Author: Prashanth Pamidi
 */

function poll (url, params, method, minWaitTime, validator) {

    var deferred = $.Deferred();

    if (!url) {

      throw new Error("URL missing");
    }

    params   = params || {};
    method   = method || "get";

    var pollingStopped = false;
    var req, resolvedData, timer;

    function stopPolling () {

      if (pollingStopped) {

        return;
      }

      pollingStopped = true;

      if (req && req.abort) {

        req.abort();
      }

      window.clearTimeout(timer);

      deferred.resolve(resolvedData);
    }

    (function _poll() {

      var startTime = new Date();

      if (pollingStopped) {

        return;
      }

      req = $[method](url, params).done(function (resp) {

        resolvedData = {"error": 0, "result": resp};

        if (pollingStopped) {

          return;
        }

        if (validator && !validator(resp)) {

          return stopPolling();
        }

        if (minWaitTime) {

          var diffTime = (new Date()) - startTime;

          if (diffTime < minWaitTime) {

            timer = window.setTimeout(_poll, minWaitTime - diffTime);
          } else {

            _poll();
          }
        } else {

          _poll();
        }
      }).fail(function () {

        if (pollingStopped) {

          return;
        }

        resolvedData = {"error": 1, "msg": "An Error Occured during poll"};
        stopPolling();
      }).always(function () {

        deferred.notify(resolvedData);
      })
    })();

    return {"stopPolling": stopPolling,
            "deferred": deferred};
  }
