// Add from 'add' field to 'timers' field
function update() {
  var timers = $('#timers');
  var res = '';

  var anything_expanded = false;

  var orig = timers.val();
  var lines = orig.split("\n");

  var shortest_time = 9999999;
  var shortest_time_description = "";

  $.each(lines, function(n,e){
    if(n+1 == lines.length && e == "") return;   // If not the last one and blank
    nth = -1;

    var before_expanded = e;
    e = expand_abbreviations(e);
    if(before_expanded != e) anything_expanded = true;

    // Split up into list of times and other things
    e = e.replace(/`/g, "'");   // Ticks not allowed, use quotes
    e = e.replace(/([0-9-]+:[0-9-][0-9-]|#|\/|!)/g, "`$1`");
    e = e.replace(/`+/g, "`");
    var l = e.split('`');

    var commented = false;
    var nth = -1;

    for(var i=0; i < l.length; i++) {   // For each token in line

      var next_item = (i+1 < l.length) ? l[i+1] : '';
      var next_next = (i+2 < l.length) ? l[i+2] : '';

      // If a comment, remember we're commented
      if(l[i] == '#') {
        commented = true;
        res += '#';
        continue;
      }

      var is_time = l[i].match(/^[0-9-]+:[0-9-][0-9-]$/);

      if(is_time && ! commented) {

        // Don't count -:--'s
        if(l[i] == '-:--') {
          res += '-:--';
          continue;
        }

        nth++;
        if((next_item == '/' && next_next != '-:--') ||   // Skip when followed by /1:00
          l[i].match(/-/)) {   // Skip if -:--
          res += l[i];
          continue;
        }

        var time = l[i].split(':');
        seconds = Number(time[0])*60 + Number(time[1]);
        if(seconds <= 0) {
          res += "0:00";   // Do nothing if 0
          continue;
        }
        seconds -= inc;

        if(seconds <= 0) {   // If it just became 0, make sound
          seconds = 0;
          if(next_item == "!")
            play('buzzer.mp3');
          else
            play(sounds[nth]);
        }
        res += seconds_to_s(seconds);

        if(seconds < shortest_time){
          shortest_time = seconds;
          shortest_time_description = before_expanded.match(/[a-z][a-z _]+/i);
          shortest_time_description = String(shortest_time_description).replace(/ +/g, ' ').replace(/ $/g, '');
        }
        continue;
      }

      res += l[i];   // If any other string, just return it
    }

    res += "\n";
  });

  document.title = shortest_time < 9999999 ? "("+(seconds_to_s(shortest_time)+") "+shortest_time_description+" - pairtimer.com") : "pairtimer.com";

  res = res.replace(/(^|[^0-9])0:00/g, '$1-:--');

  var left = timers.attr('selectionStart');
  var right = timers.attr('selectionEnd');

  orig = orig.replace(/\n+$/, '');
  res = res.replace(/\n+$/, '');
  if(orig == res) return;   // Do nothing if it didn't change

  var cursor_adjustment = res.length - orig.length;
  timers.val(res + "\n");
  if(anything_expanded) {
    left += cursor_adjustment;  if(left < 0) left = 0 ;
    right += cursor_adjustment;  if(right < 0) right = 0 ;
  }
  timers.attr('selectionStart', left);
  timers.attr('selectionEnd', right);
}

function expand_abbreviations(e) {
  e = e.replace(/(^| )[0-9]+#[0-9]+\/[0-9]+( |$)/g, function(b){   // 1# -> 1:00 #
    return b.replace(/[0-9]+/g, number_to_time).replace('#', '! #');
  });
  e = e.replace(/(^|#| )[0-9]+\/[0-9]+( |$)/g, function(b){   // 1/1
    return b.replace(/[0-9]+/g, number_to_time);
  });
  return e;
}

// Replaces 14 -> 14:00, and 15 -> 0:15, etc
function number_to_time(number) {
  number = Number(number);
  if(number == 15 || number == 30 || number == 45 || number == 90)
    return "0:"+number;
  else
    return number+":00";
}


function add() {
  var adds = $('#adds');
  // Get position of cursor CodeTree.menu/
  var cursor = adds.attr('selectionStart');
  // Get substring up until cursor, and count the linebreaks
  above = adds.val().substr(0, cursor);
  matches = above.match(/\n/g);
  line = matches ? matches.length : 0;

  // Grab out nth preset
  var add = $('#presets').val().split("\n")[line];

  add = add.replace(/(^| )([0-9]+)( |$)/g, "$1$2:00$3");
  add = add.replace(/(^| )([0-9]+)( |$)/g, "$1$2:00$3");
  var timers = $('#timers')
  timers.val( add+"\n" + timers.val().replace(welcome, '') );
  timers.focus();
  timers.attr('selectionStart', add.length); timers.attr('selectionEnd', add.length);

  return false;
}
function end() {
  var timers = $('#timers');

  timers.val(timers.val().replace(/^.*\n/, ''));
  //   timers.val(timers.val().replace(/(^|[^0-9])[0-9]+:[0-9][0-9]/, '$1-:--'));

  return false;
}

function clear() {
  $('#timers').val('');
  return false;
}

function clear_expired() {
  $('#timers').val($('#timers').val().replace(/^[^0-9\n]*-:--[^0-9\n]*\n/gm, ""));
  return false;
}

function start() {
  window.setTimeout('iterate()', 1000);
}



function iterate() {
  window.setTimeout('iterate()', inc*1000);
  update();
}

function play(surl) {
  $("#jplayer").setFile(surl).play();
}

function seconds_to_s(seconds) {
  minutes = Math.floor(seconds/60);
  seconds = String(seconds % 60);
  if(seconds.length == 1) seconds = "0"+seconds;
  return minutes + ":" + seconds;
}

function pop_up(url) {
  id = new Date().getTime();
  eval("page" + id + " = window.open(url, '" + id + "', 'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=420,height=380');");
}

function examples() {
  var the_examples = "\
Examples:\n\
0:12 0:09 0:06 0:03\n\
00:17\n\
buzzer sound       00:21!\n\
one at a time      0:10/0:10/0:27\n\
#paused            1:00\n\
partially paused   1:30 #3:00\n\
2:00               (warning in 1:00)\n\
";
  $('#timers').val( the_examples+"\n" + $('#timers').val() );
}

function save_to_cookies() {
  // TODO
}

function add_links() {
  var presets = $('#presets');
  var lines = presets.val().split("\n");
  var txt = "";
  $.each(lines, function(n,e){   // For each line in presets

    // If there's something on the line, add a link
    if($.trim(e).length > 0)
      txt += "add";

    if(n+1 == lines.length) return;   // If not the last one and blank
    txt += "\n";
  });

  var adds = $('#adds');
    // If there's a line, add "add"
  adds.val(txt);
  var height = 16 * lines.length + 5;
  adds.height(height); presets.height(height);
}

function more() {
  var presets = $('#presets')
  presets.val(presets.val()+":00\n");
  add_links();
  presets.focus();
  presets.attr('selectionStart', presets.val().length - 4);
  presets.attr('selectionEnd', presets.val().length - 4);
}

function setup_events() {
  $('#presets').keyup(add_links);
  $('#presets').keyup(save_to_cookies);
  $('#adds').click(add);
  $('#more').click(more);
  $('#clear').click(clear);
  $('#end').click(end);
  $('#clear_expired').click(clear_expired);
}

function p(s) {
  if(s == null)
    s = "[blank]";

  // Start at 0 if first
  try {prepend_index++;}
  catch(e) { prepend_index = 0; }

  $('body').append('<div style="top:'+(prepend_index*13)+'px; margin-left:5px; position:absolute; font-size:10px; z-index:1002; color:#000; filter: alpha(opacity=85); -moz-opacity: .85; opacity: .85; background-color:#999;">'+s+'</div>');
}

// On startup, start timer
$(function() {

  $("#jplayer").jPlayer( {
    //ready: function(){p('hi')},
    swfPath: "." });

  $('#menu').tabify();

  add_links();
  setup_events();

  sounds = ['guitar.mp3', 'low.mp3', 'three.mp3', 'four.mp3'];
  welcome = "Welcome to pairtimer.com!\n\
All times and most text on this page are editable.\n\n\
Try editing or clicking 'add' or 'Show Examples', or just type some times here.\n\n\
example: 0:25\n"
  var timers = $('#timers');
  timers.val(welcome);
  inc = 1;
  $('#increment').val(inc);
  $('#increment').keyup(function(){$(inc = Number($(this).val()))});

  start();

  timers.focus();
});

