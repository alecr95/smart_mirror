
// google api client id 922831018117-riq3s1ra0fc2gnqc89nmbo9ua5bv2qgp.apps.googleusercontent.com
window.addEventListener('WebComponentsReady', function () {

    // init auth bottons
    authorizeButton = document.getElementById('authorize-button');
    signoutButton = document.getElementById('signout-button');

    // buttons
    var hoverTimer;
    var hoverDelay = 1000;

    $('.hover-delay').hover(function() {
        var $target = $(this);
        // on mouse in, start a timeout
        hoverTimer = setTimeout(function() {        
            // do your stuff here
            $target.trigger('click');
        }, hoverDelay);
    }, function() {
        // on mouse out, cancel the timer
        clearTimeout(hoverTimer);
    });

    // count down bus button
    var bus_countdown_timer;
    $('#stop-input-ctr').hover(function() {
        var $target = $('#mouseover-btn');
        // on mouse in, start a timeout
        bus_countdown_timer = startInterval(1, function() {        
            // decrement counter
            var inner_span = $target.children("span");
            inner_span.html(parseInt(inner_span.html()) - 1);
            if(parseInt(inner_span.html()) <= 0) {
                $target.css({display:"none"});
                $('#stop-input-ctr #centering-ctr #bus-stop-input').css({display: "block"});
                $('#stop-input-ctr').css({display: "block", "background-color":"black", opacity:"1"});
                $('#bus-stop-input').focus()
            }
        });
    }, function() {
        // on mouse out, cancel the timer
        if (parseInt($('#mouseover-btn span').html()) > 0) {
            $('#mouseover-btn span').html("4");
        }
        
        clearTimeout(bus_countdown_timer);
    });

    // handwriting
    document.addEventListener("keypress", function(event) {
        if (event.keyCode == 13) {
            var input = document.querySelector('myscript-text-web').firstcandidate
            $(':focus').val($(':focus').val() + input)
            document.querySelector('myscript-text-web').clear();
        }
        if (event.keyCode == 32) {
            // this doesn't make sense, but if this delay is removed then chromium crashes on archlinux
            setTimeout(function() {
                $(':focus').click()
            }, 100)
        }
    })

    // update clock
    var time_interval = startInterval(1, function() {
        var momentNow = moment();

        // set date, day
        $('#date-part').html(momentNow.format('MMMM D'));
        $('#day-part').html(momentNow.format('dddd'));

        // set seconds
        var sec = document.createElement('span')
        sec.setAttribute('id', 'sec-part')
        sec.innerHTML = momentNow.format('ss A');

        // set hours:min
        $('#hrmin-part').html(momentNow.format('h:mm'));
        $('#hrmin-part').append(sec)
    });

    // bus update interval
    var bus_interval = startInterval(15, update_bus_func);

    function startInterval(seconds, callback) {
        callback();
        return setInterval(callback, seconds * 1000);
    }
});

// update bus times script
function update_bus_func() {
    $.get(
        "http://realtime.portauthority.org/bustime/api/v1/getpredictions",
        {key : 'VTnArfBnZ7xDacvUcCdqdqwYT', stpid: $('#bus-times').attr("stop")},
        function(data) {
            $('#bus-times').empty();

            var predictions = data.getElementsByTagName("prd");

            // want them to be in descending order
            for (var i = 0; i < predictions.length; i++) {
                // parse predicted arrival time
                var prdtm = moment(predictions[i].getElementsByTagName("prdtm")[0].innerHTML, "YYYYMMDD HH:mm");

                // create element with route number
                var route = document.createElement('span');
                route.setAttribute('class', 'prd-name');
                route.innerHTML = predictions[i].getElementsByTagName("rt")[0].innerHTML + ":";

                // create element with prediction time (minutes until arrival)
                var time = document.createElement('span');
                time.setAttribute('class', 'prd-time');
                var time_diff = moment.duration(prdtm.diff(moment())).asMinutes();
                if(time_diff <= .5) {
                    time.innerHTML = "DUE";
                } else {
                    time.innerHTML = time_diff.toFixed(1) + " min";
                }

                // add to page
                var ctr = document.createElement('div');
                ctr.setAttribute('class', 'prd-ctr');
                ctr.appendChild(route);
                ctr.appendChild(time);

                $('#bus-times').append(ctr);
            }
        }
    );
}

function updateBusStopOnClick(){
    // used for updating the bus stop/list
    $('#bus-times').attr('stop', this.value);

    $('#mouseover-btn').css({display:"block"});
    $('#bus-stop-input').css({display:"none"});
    $('#stop-input-ctr').css({display: "", "background-color":"", opacity:""});
    $('#mouseover-btn span').html("4");

    update_bus_func();
}

// GOOGLE SCRIPT

// Client ID and API key from the Developer Console
      var CLIENT_ID = '922831018117-riq3s1ra0fc2gnqc89nmbo9ua5bv2qgp.apps.googleusercontent.com';

      // Array of API discovery doc URLs for APIs used by the quickstart
      var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

      var authorizeButton; // = document.getElementById('authorize-button');
      var signoutButton; // = document.getElementById('signout-button');

      /**
       *  On load, called to load the auth2 library and API client library.
       */
      function handleClientLoad() {
        gapi.load('client:auth2', initClient);
      }

      /**
       *  Initializes the API client library and sets up sign-in state
       *  listeners.
       */
      function initClient() {
        gapi.client.init({
          discoveryDocs: DISCOVERY_DOCS,
          clientId: CLIENT_ID,
          scope: SCOPES
        }).then(function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          authorizeButton.onclick = handleAuthClick;
          signoutButton.onclick = handleSignoutClick;
        });
      }

      /**
       *  Called when the signed in status changes, to update the UI
       *  appropriately. After a sign-in, the API is called.
       */
      function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
          authorizeButton.style.display = 'none';
          signoutButton.style.display = 'block';
          listUpcomingEvents();
        } else {
          authorizeButton.style.display = 'block';
          signoutButton.style.display = 'none';
        }
      }

      /**
       *  Sign in the user upon button click.
       */
      function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
      }

      /**
       *  Sign out the user upon button click.
       */
      function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
      }

      /**
       * Append a pre element to the body containing the given message
       * as its text node. Used to display the results of the API call.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message) {
        var pre = document.getElementById('cal-events');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }

      /**
       * Creates a list of events returned by the API. Used to display the
       * results of the API call.
       *
       * @param {event} event to convert into display
       */
      function addEv(event) {
        var ev_container = document.getElementById('cal-events');

        var ev = document.createElement('div');
        ev.setAttribute('class', 'event');

        var when = event.start.dateTime;
        var all_day = false;
        if (!when) {
          // all day
          when = event.start.date;
          all_day = true;
        }

        var parsed_date = moment(when)

        var date_el = document.createElement('span');
        date_el.innerHTML = parsed_date.format("M/D ")
        ev.appendChild(date_el);

        if (!all_day) {
          var time_el = document.createElement('span');
          time_el.innerHTML = parsed_date.format("h:mm a");
          ev.appendChild(time_el)
        }

        var summary = document.createElement('span');
        summary.innerHTML = " " + event.summary;
        ev.appendChild(summary);

        ev_container.appendChild(ev);
      }

      /**
       * Print the summary and start datetime/date of the next ten events in
       * the authorized user's calendar. If no events are found an
       * appropriate message is printed.
       */
      function listUpcomingEvents() {
        time_min = new Date()
        time_max = new Date()
        time_max.setDate(time_min.getDate() + 7)

        gapi.client.calendar.events.list({
          'calendarId': 'primary',
          'timeMin': time_min.toISOString(),
          'timeMax': time_max.toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          // 'maxResults': 10,
          'orderBy': 'startTime'
        }).then(function(response) {
          var events = response.result.items;
          appendPre('Upcoming events:');

          if (events.length > 0) {
            document.getElementById('cal-events').innerHTML = "";

            for (i = 0; i < events.length; i++) {
              var event = events[i];
              addEv(event);
              var when = event.start.dateTime;
              // if (!when) {
              //   when = event.start.date;
              // }
              // appendPre(event.summary + ' (' + when + ')')
            }
          } else {
            appendPre('No upcoming events found.');
          }
        });
      }