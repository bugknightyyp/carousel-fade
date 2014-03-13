define(function(require, exports, module){
var $ = require('jquery/1.11.0/jquery.cmd.min');
var _ = require('underscore/1.6.0/underscore.cmd.min');
var util = require('util/1.0.3/util');
  
  var PLUGIN_NAME = 'carouselFade';
  
  function simpleFadeCarouselFactory(element, banners, options) {
    this.banners = banners;
    this.options = $.extend({
      speed: 2000,
      initCallback: $.noop
    }, options || {});
    this.element = element;
    this._index = 0;
    
    this.init();
  };
  
  var prot = simpleFadeCarouselFactory.prototype;
  
  prot.switchState = function(goIndex){
      var _this = this;
      this._indexWraps.eq(goIndex).addClass('on').siblings('.on').removeClass('on');
      this._imgWraps.filter(':animated').stop(false, true);
      if (this._index != null)
        this._imgWraps.eq(this._index).animate({opacity: 0}, 500,function(){
        });
      
      this._imgWraps.eq(goIndex).animate({opacity: 1}, 500,function(){
         _this._index = goIndex;
      });
  };
  prot.auto = function(){
          var goIndex = this._index + 1;
          if (goIndex >= this.banners.length) {
            goIndex = 0;
          }
          this.switchState(goIndex);
  };
  prot.init = function(){
    var _this = this;
    var imgStr = _.template('<% _.each(banners, function(banner) { %> '+
     '<a target=\"_blank\" href="<%= banner.href %>"><img src="<%= banner.src %>"></a> <% }); %>', {banners: banners});
    var indexStr = _.template('<ol><% _.each(banners, function(banner, index) { %> '+
     '<li target=\"_blank\" index="<%= index %>"><%= index + 1 %></li> <% }); %></ol>', {banners: banners});
    var throttle = util.throttle(300);
    
    var throttleProxy = function(){
        var index = parseInt($(this).attr('index'));
        _this.switchState(index);
    };
    this.element.html(imgStr + indexStr);
    this._imgWraps = this.element.find('> a');
    this._indexWraps = this.element.find('> ol li');
    
    this.element.on('mouseenter', 'ol li', function(e){
      throttle(throttleProxy, this);
    })
      .on('mouseenter',function(){
        clearInterval(_this._timer);
    }) 
      .on('mouseleave',function(){
        _this._timer = setInterval(function(){_this.auto();}, _this.options.speed);
    });
    
    this.switchState(0);
    this._timer = setInterval(function(){_this.auto();}, _this.options.speed);
    this.options.initCallback();
  };
  
  $.fn[PLUGIN_NAME] = function(banners, options){
    return this.each(function(){
      new simpleFadeCarouselFactory($(this), banners, options);
    })
  };
  
})