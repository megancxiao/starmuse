'use strict';

//=include vendor/jquery-3.1.0.min.js
//=include vendor/ba-tiny-pubsub.min.js
//=include vendor/three.min.js
//=include helpers.js
//=include config.js
//=include stars.js
//=include play/stars.js

var PlayApp = (function() {
  function PlayApp(options) {
    var defaults = {
      container: '#main',
      totalMs: 360000, // 6 mins
      sequence: 'data/sequence.json',
      recordMode: false
    };
    this.opt = $.extend({}, defaults, options);
    this.init();
  }

  PlayApp.prototype.init = function(){
    var _this = this;

    this.recordMode = this.opt.recordMode;
    this.seqStart = 0;
    this.lastActiveStar = -1;

    // wait for stars to be loaded
    this.queueSubscriptions(['sequence.loaded', 'stars.loaded']);

    // load stars
    this.loadSequence(this.opt.sequence);
    this.stars = new PlayStars($.extend(this.opt.harmony, {recordMode: this.recordMode}));
  };

  PlayApp.prototype.loadListeners = function(){
    var _this = this;

    // resize
    $(window).on('resize', function(){ _this.onResize(); });
  };

  PlayApp.prototype.loadSequence = function(file){
    var _this = this;

    this.sequence = [];
    $.getJSON(file, function(rows) {
      var sequence = [];
      $.each(rows, function(i, row){
        sequence.push({ t: row[0], i: row[1], y: row[2], m: row[3] });
      });
      _this.onLoadSequence(sequence);
    });
  };

  PlayApp.prototype.onLoadSequence = function(sequence){
    this.sequence = sequence;
    this.sequenceLen = sequence.length;
    $.publish('sequence.loaded', {
      message: 'Loaded ' + this.sequenceLen + ' steps in sequence.',
      count: this.sequenceLen
    });
  };

  PlayApp.prototype.onResize = function(){
    this.stars.onResize();
  };

  PlayApp.prototype.onReady = function(){
    $('.loading').hide();
    $('.instructions').show().addClass('active');
    var d = new Date();
    this.startMs = d.getTime();
    this.loadListeners();
    this.render();
  };

  PlayApp.prototype.queueSubscriptions = function(subs){
    var _this = this;
    var total = subs.length;
    var loaded = 0;

    $.each(subs, function(i, s){
      $.subscribe(s, function(e, data){
        loaded++;
        if (loaded >= total) _this.onReady();
      });
    });
  };

  PlayApp.prototype.render = function(){
    var _this = this;
    var t = new Date();
    var elapsedMs = t.getTime() - this.startMs;
    var percent = elapsedMs / this.opt.totalMs;
    percent = UTIL.lim(percent, 0, 1);

    if (!this.recordMode) this.renderSequence(percent);
    this.stars.render(percent);

    // restart loop
    if (percent >= 1) {
      this.startMs = t.getTime();
      this.lastActiveStar = -1;
    }

    // continue if time left
    if (!this.recordMode || percent < 1) {
      requestAnimationFrame(function(){
        _this.render();
      });
    } else {
      console.log('Finished.')
      this.stars.downloadSequence();
    }
  };

  PlayApp.prototype.renderSequence = function(percent){
    var start = this.lastActiveStar + 1;
    var sequence = this.sequence;
    var sequenceLen = this.sequenceLen;

    for (var i=start; i<sequenceLen; i++) {
      var step = sequence[i];
      // active star
      if (percent >= step.t) {
        this.stars.flashStar(step);
        this.lastActiveStar = i;
      }
    }
  };

  return PlayApp;

})();

$(function() {
  var app = new PlayApp(CONFIG);
});
