var scrolledTo = "";
var activeNavItem = (function() {
 return $(".nav-item").has('.nav-link.active')[0];
})
var sectionOn = "";
var previousNavItem = "";
var isButtonScrolling = false;
var currentTab = 0; // Current tab is set to be the first tab (0)
var currentSubTab = -1;
var globalTabCounter = 0; //to keep count of tab regardless of whether or not it is a subTab or a Tab
var subTabGroup = ""; // Current subtab group if set
var subTabs = function() {
  return (document.getElementsByClassName('subGroup' + subTabGroup))
}
var readyToSubmit = "false";

$.effects.effect.customSlide = function (options) {
    var el = $(this),
        props = ['position', 'top', 'bottom', 'left', 'right'];

    // Set options
    var mode = $.effects.setMode(el, options.mode || 'show'); // Set Mode
    var direction = options.direction || 'left'; // Default Direction
    // Adjust
    $.effects.save(el, props);
    el.show(); // Save & Show
    $.effects.createWrapper(el).css({
        overflow: 'hidden'
    }); // Create Wrapper
    var ref = (direction == 'up' || direction == 'down') ? 'top' : 'left';
    var motion = (direction == 'up' || direction == 'left') ? 'pos' : 'neg';
    var distance = options.distance || (ref == 'top' ? el.outerHeight(true) : el.outerWidth(true));
    if (mode == 'show') el.parent().css('height', 0);
    if (mode == 'show') el.css(ref, motion == 'pos' ? (isNaN(distance) ? "-" + distance : -distance) : distance); // Shift
    // Animation
    var animation = {};
    animation[ref] = (mode == 'show' ? (motion == 'pos' ? '+=' : '-=') : (motion == 'pos' ? '-=' : '+=')) + distance;
    el.parent().animate({
        height: (mode == 'show' ? distance : 0)
    }, {
        queue: false,
        duration: options.duration,
        easing: options.easing
    });
    el.animate(animation, {
        queue: false,
        duration: options.duration,
        easing: options.easing,
        complete: function () {
            if (mode == 'hide') el.hide(); // Hide
            $.effects.restore(el, props);
            $.effects.removeWrapper(el); // Restore
            if (options.callback) options.callback.apply(this, arguments); // Callback
            el.dequeue();
        }
    });
};

function fadeIn() {
  if (document.readyState !== 'loading') {
    setTimeout(function() {
      document.body.className = '';
    }, 230);
  } else {
    document.body.className = '';
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(function() {
        document.body.className = '';
      }, 230);
    });
  }
}

function fadeOut() {
  document.body.classList.remove('fade');
}

function checkNavFade() {
  if(scrollY <= 308) {
    $("#the-navbar").removeClass('navbar-fadein');
  } else {
    $('#the-navbar').addClass('navbar-fadein');
  }
}

function underlineActivePage(done) {
  return new Promise(resolve => {
  $(activeNavItem()).find("span.nav-select-indicator").animate({
    width: 'toggle', 
    display: 'block'}, 
    {
      start: function() {
        $(this).css('display', 'block')
      },
    }, 350);
    resolve(done);
  })
}

function deselect(element) {
  return new Promise(function(resolve, reject) {
    console.log('first we deselect');
    let allActiveLinks = $('nav').find('a.nav-link.active').toArray();
    allActiveLinks.forEach(function(item) {
      $(item).removeClass('active');
      $(item).next().find('span.nav-select-indicator').animate({width: 'toggle'});
    })
    setTimeout(function() {
      resolve('done');
    }, 100)
  })
}

function select(element) {
  return new Promise(function(resolve, reject) {
    console.log('then we select');
    console.log($(element).find('a.nav-link'))
    $(element).find('a.nav-link').addClass('active');
    $(element).children('span').find('span.nav-select-indicator').animate({
        width: 'show',},
        {
          start: function() {
            $(this).queue(function(next){
              $(this).css('display', 'block');
              next();
            })
            if(scrolledTo !== "") {
              $(this).stop(false, false);
            }
          },
        },350);
        setTimeout(function() {
          resolve('done');
        }, 200)
  })
}

function brandNewToggler(clickedPage) {
  //lock in our needed variables including the link we switched off
  let oldNavItem = $('.nav-link.active')[0];
  //lock in the name of the nav item we switched off
  previousNavItem = $(oldNavItem).attr('id');
  //remove the active class from the old item
  async function afterDeselect() {
    const starter = await deselect(oldNavItem);
    const next = await select(clickedPage);
  }
  afterDeselect().then(function() {
    isButtonScrolling = false;
  })
  console.log('BUTTON HAS FINISHED SCROLLING');
}

function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");
  var selectedTab = x[currentTab];
  // Exit the function if any field in the current tab is invalid:
  if (n == 1 && !validateForm()) return false;
// FOR WHEN AFTER I'VE FIXED THE SHOW/HIDE FOR GOING BACKWARDS
  if (globalTabCounter == 1 && n > 0) {
    currentSubTab = 0;
  } else if (globalTabCounter == 2 && n < 0) {
    currentSubTab = -1;
  }
  // Hide the current tab:
  async function waitForHide() {
    const starter = await hideTab(selectedTab, n);
    if (globalTabCounter < 1 && n > 0 || globalTabCounter < 2 && n < 0) {
      currentTab = currentTab + n;
    }
    const finisher = await doWeSubmit(n);
    globalTabCounter = globalTabCounter + n;
  }
  waitForHide().then(function() {
    showTab(currentTab, n);
    console.log('this should only run after the hide!');
  })
}

function hideTab(t, proOrDegress) {
  return new Promise(function(resolve) {
    if (currentSubTab <= 0) {
      if (proOrDegress  > 0 && globalTabCounter <= 1) {
        $(t).toggle('customSlide', { direction: 'left' });
      } 
      if (proOrDegress > 0 && globalTabCounter >= 2) {
        var s = $(subTabs())[currentSubTab];
        $(s).toggle('customSlide', { direction: 'left' });
      }
      if (proOrDegress < 0 && globalTabCounter == 1) {
        $(t).toggle('customSlide', { direction: 'right' });
      }
      if (proOrDegress < 0 && globalTabCounter == 2) {
        var s = $(subTabs())[0];
        $(s).toggle('customSlide', { direction: 'right' });
      }
    } else if (currentSubTab > 0){
      if (proOrDegress > 0) {
        var s = $(subTabs())[currentSubTab];
        $(s).toggle('customSlide', { direction: 'left' });
      } else if (proOrDegress < 0) {
        var s = $(subTabs())[currentSubTab];
        $(s).toggle('customSlide', { direction: 'right' });
      }
    }
    setTimeout(function() {
    resolve('done');
    console.log('WE JUST FINISHED HIDING THE OTHER TAB')
    }, 350)
  })
}

function showTab(n, proOrDegress) {
  return new Promise(function(resolve) {
    // This function will display the specified tab of the form ...
    var x = document.getElementsByClassName("tab");
    var u = x[n];
    console.log('WE BOUTA SLIDE THE NEW ONE IN yeah?')
    if (proOrDegress > 0) {
      if (currentTab == x.length - 1 && currentSubTab == -1) {
        $(u).toggle('slide', { direction: 'right' });
      } 
      if (currentTab == x.length - 1 && subTabGroup !== "" && currentSubTab !== -1) {
        if (globalTabCounter > 2){
          currentSubTab++;
        }
        var s = $(subTabs())[currentSubTab];
        $(s).toggle('slide', { direction: 'right' });
      }
      console.log('we should be progressing meaning the new element slides from the right to the left');
    } else if (proOrDegress < 0) {
      if (currentTab <= x.length - 1 && currentSubTab == -1|| currentTab == x.length - 1 && globalTabCounter == 1) {
        $(u).toggle('slide', { direction: 'left' });
      } 
      if (currentTab == x.length - 1 && subTabGroup !== "" && currentSubTab > 0) {
        if (globalTabCounter >= 2){
          currentSubTab--;
        };
        var s = $(subTabs())[currentSubTab];
        $(s).toggle('slide', { direction: 'left' });
        console.log('we should be degressing aka sliding in from the left to the right');
      }
    } else {
      console.log('sliding our starting position from right to left');
      $(u).toggle('slide', { direction: 'right' });
    }
    // ... and fix the Previous/Next buttons:
    if (n == 0) {
      document.getElementById("prevBtn").style.display = "none";
    } else {
      document.getElementById("prevBtn").style.display = "inline";
    }
    if (n > 0) {
      document.getElementById("nextBtn").innerHTML = "Next";
    }
    if (proOrDegress < 0) {
      if (readyToSubmit !== false) {
        readyToSubmit = false;
      }
    }
    if (currentSubTab == subTabs().length - 1 && currentSubTab !== -1) {
      document.getElementById("nextBtn").innerHTML = "Submit";
      readyToSubmit = true;
    }
    // ... and run a function that displays the correct step indicator:
    fixStepIndicator(globalTabCounter)
    setTimeout(function() {
      resolve('done');
    }, 100)
  })
}

function doWeSubmit(proOrDegress) {
  return new Promise(function(resolve, reject) {
    if (currentSubTab == subTabs().length - 1 && currentSubTab !== -1 && readyToSubmit == true && proOrDegress !== -1) {
      const data = $('#contact-page').serialize()
      $.post('/contact', data, function() {
        window.location.assign('/submitted')
      });
      setTimeout(function() {
        reject('failed');
        })
    }else {
      setTimeout(function() {
        resolve('done');
      }, 100)
    }
  })
}

function validateForm() {
  // This function deals with validation of the form fields
  var x, y, i, valid = true;
  $('#contact-page').validate();
  valid = $('#contact-page').valid();
// Maybe unnecessary code!
  // x = document.getElementsByClassName("tab");
  // y = x[currentTab].getElementsByTagName("input");
  // A loop that checks every input field in the current tab:
  // for (i = 0; i < y.length; i++) {
  //   // If a field is empty...
  //   if (y[i].value == "") {
  //     // add an "invalid" class to the field:
  //     y[i].className += " invalid";
  //     // and set the current valid status to false:
  //     valid = false;
  //   }
  // }
  // If the valid status is true, mark the step as finished and valid:
  if (valid) {
    var stepDot = document.getElementsByClassName("step")[globalTabCounter];
    if ($(stepDot).hasClass('finish') !== true) {
      stepDot.className += " finish";
    };
  }
// End of potentially unnecessary code
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  //... and adds the "active" class to the current step:
  x[n].className += " active";
}

//handle nav-link button scrolling
function moveTo(section) {
  isButtonScrolling = true;
  //check if the section that we're on doesn't match the ID of the section being passed into moveTo to avoid double toggling animations and then set section on and scrolledTo
  //to really make sure that the scroll listener doesn't activate in the process of scrolling.
  if (sectionOn !== $(section).attr('id')){
    if ($(section).text() == 'HOME') {
      sectionOn = 'home';
      scrolledTo = 'home';
      scrollTo(0, 0);
    }
    if ($(section).text() == 'SERVICES') {
      sectionOn = 'services';
      scrolledTo = 'services';
      scrollTo(0, 911);
    }
    if ($(section).text() == 'ABOUT US') {
      sectionOn = 'about-us';
      scrolledTo = 'about us';
      scrollTo(0, 1457);
    }
    if ($(section).text() == 'GRAPHICS') {
      sectionOn = 'graphics';
      scrolledTo = 'graphics';
      scrollTo(0, 2200);
    }
    if ($(section).text() == 'WEB SERVICES') {
      sectionOn = 'web-services';
      scrolledTo = 'web services';
      scrollTo(0, 3127);
    }
  };
}

function checkIfNumber(char) {
  return !isNaN(char);
}

function phoneMask(event) { 
  var num = $(this).val().replace(/\D/g,''); 
  if (checkIfNumber(event.key) == false && event.key !== 'Backspace') {
    event.preventDefault();
    console.log(event.key);
  } else if (checkIfNumber(event.key) == true) {
    $(this).val('(' + num.substring(0,3) + ')' + ' ' + num.substring(3,6) + '-' + num.substring(6,9));
  }
}
$('#contactPhone').keydown(phoneMask);

// handle fadein & site selection upon entering website
window.onload = function() {
  fadeIn();
  checkNavFade();
//if scroll position is at top of page, underline the active nav link and set section on to the active nav item's ID
  if (window.scrollY < 911) {
    underlineActivePage();
    sectionOn = $(activeNavItem()).find('a').attr('id');
  }
//handle homepage underlining when scroll position is past the top
  if (window.scrollY >= 911 && window.scrollY < 1457 ) {
    sectionOn = 'services';
  }
  if(window.scrollY >= 1457 && window.scrollY < 2200){
    sectionOn = 'about-us'
  }
  if(window.scrollY >= 2200 && window.scrollY < 3127){
    sectionOn = 'graphics'
  }
  if(window.scrollY >= 3127){
    sectionOn = 'web-services'
  }
  //shows the right form "tab" only if we're on the Contact Us page
  if ($(activeNavItem()).find('a').attr('id') == 'contact') {
    showTab(currentTab);  
  };
  //fades in our form completed elements
  var onSubmitElements = $('.submit-fade');
  setTimeout(function() {
    for (i = 0; i < onSubmitElements.length; i++) {
      var currentSubmitElement = onSubmitElements[i]
      $(currentSubmitElement).toggle('fade');
    }
  }, 600)
  //disables the unused inputs on subtabs so they're left out of the form
  disableInputs();
}

// handle fadeout before leaving website
window.onbeforeunload = fadeOut(), $('#contact-page').trigger("reset");

//handle scroll events
$(window).on('scroll', function() {
  //checks if we need to fade in the navbar based on scroll position
  checkNavFade();
  //check the scroll position and perform secondary check on the section that we're on (incase these togglers were already triggered by the moveTo function)
  if (window.scrollY < 911 && sectionOn !== "home") {
      sectionOn = "home";
      //if button is not the reason we're scrolling, handle the selection and deselection of nav-links (to avoid double selection causing animation issues)
      if (isButtonScrolling == false && scrolledTo !== 'home') {
        let oldNavItem = $('.nav-link.active')[0];
        let newNavItem = $(".nav-item").has('#home');
        //ensure that we wait for deselection of old nav-link and selection of new nav link before setting "scrolledTo" to none
        //(which fixes issues of scrolling and then clicking a nav link)
        async function afterDeselect() {
          const starter = await deselect(oldNavItem);
          const next = await select(newNavItem);
        }
        afterDeselect();
        scrolledTo = "";
      }
  }
  if (window.scrollY >= 911 && window.scrollY < 1457 && sectionOn !== "services") {
      sectionOn = "services";
      //if button is not the reason we're scrolling, handle the selection and deselection of nav-links (to avoid double selection causing animation issues)
      if (isButtonScrolling == false && scrolledTo !== 'services') {
        let oldNavItem = $('.nav-link.active')[0];
        let newNavItem = $(".nav-item").has('#services');
        //ensure that we wait for deselection of old nav-link and selection of new nav link before setting "scrolledTo" to none
        //(which fixes issues of scrolling and then clicking a nav link)
          async function afterDeselect() {
            const starter = await deselect(oldNavItem);
            const next = await select(newNavItem);
          }
          afterDeselect();
          scrolledTo = "";
      }
  }
  if (window.scrollY >= 1457 && window.scrollY < 2200 && sectionOn !== "about-us") {
    sectionOn = "about-us";
    //if button is not the reason we're scrolling, handle the selection and deselection of nav-links (to avoid double selection causing animation issues)
    if (isButtonScrolling == false && scrolledTo !== 'about us') {
      let oldNavItem = $('.nav-link.active')[0];
      let newNavItem = $(".nav-item").has('#about-us');
        //ensure that we wait for deselection of old nav-link and selection of new nav link before setting "scrolledTo" to none
        //(which fixes issues of scrolling and then clicking a nav link)
        async function afterDeselect() {
          const starter = await deselect(oldNavItem);
          const next = await select(newNavItem);
        }
        afterDeselect();
        scrolledTo = "";
    }
  }
  if (window.scrollY >= 2200 && window.scrollY < 3127 && sectionOn !== "graphics") {
    sectionOn = "graphics";
    //if button is not the reason we're scrolling, handle the selection and deselection of nav-links (to avoid double selection causing animation issues)
    if (isButtonScrolling == false && scrolledTo !== 'graphics') {
      let oldNavItem = $('.nav-link.active')[0];
      let newNavItem = $(".nav-item").has('#graphics');
        //ensure that we wait for deselection of old nav-link and selection of new nav link before setting "scrolledTo" to none
        //(which fixes issues of scrolling and then clicking a nav link)
        async function afterDeselect() {
          const starter = await deselect(oldNavItem);
          const next = await select(newNavItem);
        }
        afterDeselect();
        scrolledTo = "";
    }
  }
  if (window.scrollY >= 3127 && sectionOn !== "web-services") {
    sectionOn = "web-services";
    //if button is not the reason we're scrolling, handle the selection and deselection of nav-links (to avoid double selection causing animation issues)
    if (isButtonScrolling == false && scrolledTo !== 'web services') {
      let oldNavItem = $('.nav-link.active')[0];
      let newNavItem = $(".nav-item").has('#web-services');
        //ensure that we wait for deselection of old nav-link and selection of new nav link before setting "scrolledTo" to none
        //(which fixes issues of scrolling and then clicking a nav link)
        async function afterDeselect() {
          const starter = await deselect(oldNavItem);
          const next = await select(newNavItem);
        }
        afterDeselect();
        scrolledTo = "";
    }
  }
})

// handle listener for hovering over the navbar
$( "#the-navbar" ).hover(function() {
  $("#the-navbar").addClass('navbar-fadein');
}, function() {
  if(scrollY <= 308) {
  $("#the-navbar").removeClass('navbar-fadein');
  }
})

// handle listener for underlining navbar items
$(".nav-item").hover(function() {
  if ($(this).find('.nav-link').hasClass('active') == false && sectionOn !== $(this).find('.nav-link').attr('id')) {
    console.log('logging our attribute');
    console.log($(this).find('.nav-link').attr('id'));
    $(this).on('click', function() {
      brandNewToggler($(this));
    });
    if (isButtonScrolling == false) {
      $(this).find("span.nav-select-indicator").animate({
        width: 'toggle', 
        display: 'block'}, 
        {
          start: function() {
            $(this).css('display', 'block')
          },
        }
      );      
    }
  };
})

function disableInputs() {
  var subTabInputs = $('.subTab').find('input');
  var subTabTextAreas = $('.subTab').find('textarea');
  for (i = 0; i < subTabInputs.length; i++) {
    var currentInput = subTabInputs[i]; 
    $(currentInput).attr('disabled', true);
  }
  for (i = 0; i < subTabTextAreas.length; i++) {
    var currentInput = subTabTextAreas[i]; 
    $(currentInput).attr('disabled', true);
  }
}

function enableInputs() {
  var newSubTabInputs = $(subTabs()).find('input');
  var newSubTabTextAreas = $(subTabs()).find('textarea');
  console.log('logging the new inputs');
  console.log(newSubTabInputs);
  console.log('logging the new textareas');
  console.log(newSubTabTextAreas);
  for (i = 0; i < newSubTabInputs.length; i++) {
    var currentInput = newSubTabInputs[i]; 
    $(currentInput).attr('disabled', false);
  }
  for (i = 0; i < newSubTabTextAreas.length; i++) {
    var currentInput = newSubTabTextAreas[i]; 
    $(currentInput).attr('disabled', false);
  }
}

function subTabSelector() {
  if ($('input.service-check-input:checked').val() == 'general-inquiry'){
    subTabGroup = '0';
  }
  if ($('input.service-check-input:checked').val() == 'custom-music-production'){
    subTabGroup = '1';
  }
  if ($('input.service-check-input:checked').val() == 'mixing-engineering'){
    subTabGroup = '2';
  }
  if ($('input.service-check-input:checked').val() == 'graphic-services'){
    subTabGroup = '3';
  }
  if ($('input.service-check-input:checked').val() == 'web-services'){
    subTabGroup = '4';
  }
}

function addSteps() {
  for (i = 0; i < subTabs().length; i++){
    $('#step-holder').append('<span class="step subStep"></span>');
  }
}

function removeSteps() {
  for (i = 0; i < subTabs().length; i++) {
    $('.subStep').remove()
  }
}

$('.service-check-input').on('change', function() {
  console.log($('input.service-check-input:checked').val());
  if (subTabGroup == "") {
    subTabSelector();
    addSteps();
    enableInputs();
  } else {
    removeSteps();
    disableInputs();
    subTabSelector();
    enableInputs();
    addSteps();
  }
})

$('.form-check-web').on('change', function() {
  if ($('input.form-check-web:checked').val() == 'design & development'){
    var parentHolder = $('input.form-check-web:checked').parents('.contact-input-radio-container');
    $(parentHolder).find('.hidden-question').slideDown();
  }
  if ($('input.form-check-web:checked').val() !== 'design & development'){
    var parentHolder = $('input.form-check-web:checked').parents('.contact-input-radio-container');
    $(parentHolder).find('.hidden-question').slideUp();
  }
})
