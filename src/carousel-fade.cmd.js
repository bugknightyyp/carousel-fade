define(function(require, exports, module){
var $ = require('jquery/1.11.0/jquery.cmd.min');
var _ = require('underscore/1.6.0/underscore.cmd.min');
var util = require('util/1.0.4/util.cmd');
  
  var PLUGIN_NAME = 'carouselFade';
  
  function simpleFadeCarouselFactory(element, banners, options) {
    this.banners = banners;
    this.options = $.extend({
      speed: 2000,
      isContainBtn: true,
      initCallback: $.noop,
      completeCallback: $.noop
    }, options || {});
    this.options.initCallback();
    
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
        this._imgWraps.eq(this._index).animate({opacity: 0}, 1000,function(){
          $(this).css({'z-index': 0});
        });
      
      this._imgWraps.eq(goIndex).animate({opacity: 1}, 1000,function(){
         _this._index = goIndex;
         $(this).css({'z-index': 1});
      });
  };
  prot.correctIndex = function(index){
    if (index >= this.banners.length) {
      index = 0;
    }
    if (index < 0) {
      index = this.banners.length - 1;
    }
    return index;
  };
  prot.auto = function(){
          var goIndex = this.correctIndex(this._index + 1);
          this.switchState(goIndex);
  };
  prot.init = function(){
    var _this = this;
    var imgStr = _.template('<% _.each(banners, function(banner) { %> '+
     '<a target="_blank" style="disiplay: block; background: url(<%= banner.src %>) center center no-repeat;"  href="<%= banner.href %>"></a> <% }); %>', {banners: banners});
    var indexStr = _.template('<div class="carousel-index"><ol><% _.each(banners, function(banner, index) { %> '+
     '<li index="<%= index %>"><%= index + 1 %></li> <% }); %></ol></div>', {banners: banners});
    
    var btnStr = '<div class="carousel-btn carousel-btn-left"></div><div class="carousel-btn carousel-btn-right"></div>'
    
    var throttleProxy = util.throttle( function(el){
        var index = parseInt($(el).attr('index'));
        _this.switchState(index);
    }, 200, this);
    
    this.element.html(imgStr + indexStr + (this.options.isContainBtn? btnStr : ''));
    this._imgWraps = this.element.find('> a');
    this._indexWraps = this.element.find('ol li');
    this._btns = this.element.find('.carousel-btn');
    
    this.element.on('mouseenter', 'ol li', function(e){
      throttleProxy(this);
    })
      .on('mouseenter',function(){
        clearInterval(_this._timer);
    }) 
      .on('mouseleave',function(){
        clearInterval(_this._timer);
        _this._timer = setInterval(function(){_this.auto();}, _this.options.speed);
    }).on('click', '.carousel-btn', function(e){
      var indexBtn = _this._btns.index(this);
      var goToIndex;
      if (indexBtn == 0)
        goToIndex = _this.correctIndex(_this._index - 1 );
      else 
        goToIndex = _this.correctIndex(_this._index + 1 );
      _this.switchState(goToIndex);
    });
    
    this.switchState(0);
    this._timer = setInterval(function(){_this.auto();}, _this.options.speed);
    
    this.options.completeCallback();
  };
  
  $.fn[PLUGIN_NAME] = function(banners, options){
    return this.each(function(){
      new simpleFadeCarouselFactory($(this), banners, options);
    })
  };
  
})