// Add from 'add' field to 'timers' field
function add(event) {
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
function clear() {
  $('#timers').val('');
  return false;
}

function clear_expired() {
  $('#timers').val($('#timers').val().replace(/^[^0-9\n]+:[^0-9\n]+\n/gm, ""));
  return false;
}

function start() {
  window.setTimeout('iterate()', 1000);
}

function update() {
  var timers = $('#timers');
  var res = '';

  var lines = timers.val().split("\n");

  $.each(lines, function(n,e){
    if(n+1 == lines.length && e == "") return;   // If not the last one and blank
    nth = -1;

    if(/^ *#/.test(e)) {   // Don't increment # comment lines
    }else{
      e = e.replace(/[0-9]+:[0-9][0-9]/g, function(time){
        nth++;

        time = time.split(':');
        seconds = Number(time[0])*60 + Number(time[1]);

        if(seconds <= 0) return "0:00";   // Do nothing if 0
        seconds -= inc;

        // If it just became 0, make sound
        if(seconds <= 0) {
          seconds = 0;
          play(sounds[nth]);
        }
        return seconds_to_s(seconds);
      });
    }

    res += e+"\n";
  });

  res = res.replace(/(^|[^0-9])0:00/g, '$1-:--');

  var left = timers.attr('selectionStart');
  var right = timers.attr('selectionEnd');
  timers.val(res);
  timers.attr('selectionStart', left);
  timers.attr('selectionEnd', right);

}

function iterate() {
  window.setTimeout('iterate()', inc*1000);
  update();
}

function play(surl) {
  document.getElementById("soundspan").innerHTML = "<embed src='"+surl+"' hidden=true autostart=true loop=false>";
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
twenty seconds     0:20\n\
minute 1:00        (warning in 0:30)\n\
every ten minutes  30:00 20:00 10:00\n\
";
  $('#timers').val( the_examples+"\n" + $('#timers').val() );
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
  $('#adds').click(add);
  $('#more').click(more);
  $('#clear').click(clear);
  $('#clear_expired').click(clear_expired);
}

// On startup, start timer
$(function() {

  $('#menu').tabify();

  add_links();
  setup_events();

  sounds = ['one.mp3', 'two.mp3', 'three.mp3', 'four.mp3'];
  welcome = "Welcome to pairtimer.com!\nClick an 'add' link.\nOptionally, you can change the times.\n\nOr just type some times here.\n"
  var timers = $('#timers');
  timers.val(welcome);
  inc = 1;
  $('#increment').val(inc);
  $('#increment').keyup(function(){$(inc = Number($(this).val()))});

  start();

  timers.focus();
});
