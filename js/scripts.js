$(document).ready(function(){

  // START MAIN SLIDER
  slidr.create('slidr-level-1', {
    after: function(e) { console.log('in: ' + e.in.slidr); },
    before: function(e) { console.log('out: ' + e.out.slidr); },
    breadcrumbs: false,
    controls: 'border',
    direction: 'horizontal',
    fade: false,
    keyboard: true,
    overflow: true,
    pause: false,
    theme: '#222',
    timing: { 'cube': '0.5s ease-in' },
    touch: true,
    transition: 'linear'
  }).start();


  // START VIRTUAL KEYBOARD
  $(function () {
     jsKeyboard.init("virtualKeyboard");

     //first input focus
     var $firstInput = $(':input').first().focus();
     jsKeyboard.currentElement = $firstInput;
     jsKeyboard.currentElementCursorPosition = 0;
  });  

});