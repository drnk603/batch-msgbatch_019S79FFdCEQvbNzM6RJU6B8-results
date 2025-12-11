(function() {
  'use strict';

  var app = window.__app = window.__app || {};

  var MOBILE_BREAKPOINT = 1024;
  var SMALL_BREAKPOINT = 576;

  function debounce(fn, delay) {
    var timer = null;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    };
  }

  function throttle(fn, limit) {
    var waiting = false;
    return function() {
      if (!waiting) {
        fn.apply(this, arguments);
        waiting = true;
        setTimeout(function() {
          waiting = false;
        }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (app.burgerInit) return;
    app.burgerInit = true;

    var nav = document.querySelector('.c-nav#main-nav');
    var toggle = document.querySelector('.c-nav__toggle');
    var navList = document.querySelector('.c-nav__list');
    var body = document.body;

    if (!nav || !toggle || !navList) return;

    var focusableElements = 'a[href], button:not([disabled]), textarea, input, select';

    function isOpen() {
      return nav.classList.contains('is-open');
    }

    function openMenu() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      trapFocus();
    }

    function closeMenu() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    function trapFocus() {
      var focusable = navList.querySelectorAll(focusableElements);
      if (focusable.length === 0) return;

      var firstFocusable = focusable[0];
      var lastFocusable = focusable[focusable.length - 1];

      function handleTab(e) {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }

      navList.addEventListener('keydown', handleTab);
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (isOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen()) {
        closeMenu();
      }
    });

    document.addEventListener('click', function(e) {
      if (!isOpen()) return;
      if (!nav.contains(e.target)) {
        closeMenu();
      }
    });

    var navLinks = document.querySelectorAll('.c-nav__item');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        if (isOpen()) {
          closeMenu();
        }
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= MOBILE_BREAKPOINT && isOpen()) {
        closeMenu();
      }
    }, 200);

    window.addEventListener('resize', resizeHandler);
  }

  function initAnchors() {
    if (app.anchorsInit) return;
    app.anchorsInit = true;

    var isHomepage = window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname.endsWith('/index.html');

    if (!isHomepage) {
      var sectionLinks = document.querySelectorAll('a[href^="#"]');
      for (var i = 0; i < sectionLinks.length; i++) {
        var link = sectionLinks[i];
        var href = link.getAttribute('href');
        if (href && href !== '#' && href !== '#!' && href.indexOf('/#') !== 0) {
          link.setAttribute('href', '/' + href);
        }
      }
    }

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      var href = target.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      if (href.indexOf('#') === 0) {
        var sectionId = href.substring(1);
        var section = document.getElementById(sectionId);

        if (section) {
          e.preventDefault();

          var header = document.querySelector('.l-header');
          var offset = header ? header.offsetHeight : 80;

          var elementPosition = section.getBoundingClientRect().top;
          var offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  }

  function initActiveMenu() {
    if (app.activeMenuInit) return;
    app.activeMenuInit = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.c-nav__item');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkPath = link.getAttribute('href');

      if (!linkPath) continue;

      var isActive = false;

      if (linkPath === '/' || linkPath === '/index.html') {
        isActive = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html');
      } else {
        var cleanLinkPath = linkPath.replace(/^//, '');
        var cleanCurrentPath = currentPath.replace(/^//, '');
        isActive = cleanCurrentPath === cleanLinkPath || cleanCurrentPath.indexOf(cleanLinkPath) === 0;
      }

      if (isActive) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('active');
      }
    }
  }

  function initImages() {
    if (app.imagesInit) return;
    app.imagesInit = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.hasAttribute('loading')) {
        var isCritical = img.classList.contains('c-logo__img') || img.hasAttribute('data-critical');
        if (!isCritical) {
          img.setAttribute('loading', 'lazy');
        }
      }

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      img.addEventListener('error', function(e) {
        var failedImg = e.target;
        var isLogo = failedImg.classList.contains('c-logo__img');

        var svgPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e9ecef" width="400" height="300"/%3E%3Ctext fill="%236c757d" font-family="Arial,sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage not available%3C/text%3E%3C/svg%3E';

        failedImg.src = svgPlaceholder;
        failedImg.style.objectFit = 'contain';

        if (isLogo) {
          failedImg.style.maxHeight = '40px';
        }
      });
    }
  }

  function initForms() {
    if (app.formsInit) return;
    app.formsInit = true;

    var forms = document.querySelectorAll('.c-form, .needs-validation');

    var notifyContainer = document.createElement('div');
    notifyContainer.className = 'position-fixed top-0 end-0 p-3';
    notifyContainer.style.cssText = 'z-index: 9999; position: fixed; top: 20px; right: 20px; max-width: 400px;';
    document.body.appendChild(notifyContainer);

    app.notify = function(message, type) {
      type = type || 'info';
      var colors = {
        info: '#3282b8',
        success: '#27ae60',
        warning: '#f39c12',
        danger: '#e74c3c'
      };

      var alert = document.createElement('div');
      alert.style.cssText = 'background: ' + colors[type] + '; color: #fff; padding: 16px 20px; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease-out; position: relative;';
      alert.innerHTML = message + '<button style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: #fff; font-size: 20px; cursor: pointer; padding: 4px 8px; line-height: 1;">&times;</button>';

      var closeBtn = alert.querySelector('button');
      closeBtn.addEventListener('click', function() {
        alert.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(function() {
          if (alert.parentNode) {
            notifyContainer.removeChild(alert);
          }
        }, 300);
      });

      notifyContainer.appendChild(alert);

      setTimeout(function() {
        if (alert.parentNode) {
          alert.style.animation = 'slideOut 0.3s ease-in';
          setTimeout(function() {
            if (alert.parentNode) {
              notifyContainer.removeChild(alert);
            }
          }, 300);
        }
      }, 5000);
    };

    var style = document.createElement('style');
    style.textContent = '@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }';
    document.head.appendChild(style);

    function validateField(field) {
      var fieldName = field.name || 'field';
      var fieldType = field.type;
      var value = field.value.trim();
      var errorMsg = '';

      if (field.hasAttribute('required') && !value) {
        errorMsg = 'Dit veld is verplicht';
      } else if (fieldType === 'email' || field.name.toLowerCase().includes('email') || field.name.toLowerCase().includes('e-mail')) {
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailPattern.test(value)) {
          errorMsg = 'Voer een geldig e-mailadres in';
        }
      } else if (fieldType === 'tel' || field.name.toLowerCase().includes('phone') || field.name.toLowerCase().includes('tel')) {
        var phonePattern = /^[\+\d\s\(\)\-]{10,20}$/;
        if (value && !phonePattern.test(value)) {
          errorMsg = 'Voer een geldig telefoonnummer in (10-20 tekens)';
        }
      } else if (field.name.toLowerCase().includes('name') || field.name.toLowerCase().includes('naam')) {
        var namePattern = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
        if (value && !namePattern.test(value)) {
          errorMsg = 'Naam mag alleen letters, spaties en koppeltekens bevatten (2-50 tekens)';
        }
      } else if (fieldType === 'textarea' || field.tagName === 'TEXTAREA') {
        if (value && value.length < 10) {
          errorMsg = 'Bericht moet minimaal 10 tekens bevatten';
        }
      }

      var errorElement = field.parentElement.querySelector('.c-form__error');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'c-form__error';
        field.parentElement.appendChild(errorElement);
      }

      if (errorMsg) {
        field.classList.add('has-error');
        errorElement.textContent = errorMsg;
        errorElement.classList.add('is-visible');
        errorElement.style.display = 'block';
        return false;
      } else {
        field.classList.remove('has-error');
        errorElement.classList.remove('is-visible');
        errorElement.style.display = 'none';
        return true;
      }
    }

    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];

      var inputs = form.querySelectorAll('input, textarea, select');
      for (var j = 0; j < inputs.length; j++) {
        inputs[j].addEventListener('blur', function() {
          validateField(this);
        });
      }

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var currentForm = this;
        var fields = currentForm.querySelectorAll('input, textarea, select');
        var isValid = true;

        for (var k = 0; k < fields.length; k++) {
          if (!validateField(fields[k])) {
            isValid = false;
          }
        }

        if (!isValid) {
          app.notify('Controleer de gemarkeerde velden en probeer opnieuw', 'warning');
          return;
        }

        var submitBtn = currentForm.querySelector('button[type="submit"], .c-button--primary, .c-form__submit');
        var originalText = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.position = 'relative';
          submitBtn.innerHTML = '<span style="display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 8px;"></span>Verzenden...';
          
          var spinStyle = document.createElement('style');
          spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
          document.head.appendChild(spinStyle);
        }

        setTimeout(function() {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
          app.notify('Uw bericht is succesvol verzonden!', 'success');
          currentForm.reset();
          
          var errors = currentForm.querySelectorAll('.c-form__error');
          for (var m = 0; m < errors.length; m++) {
            errors[m].style.display = 'none';
          }
          var hasErrors = currentForm.querySelectorAll('.has-error');
          for (var n = 0; n < hasErrors.length; n++) {
            hasErrors[n].classList.remove('has-error');
          }

          setTimeout(function() {
            window.location.href = 'thank_you.html';
          }, 1500);
        }, 1500);
      });
    }
  }

  function initScrollAnimations() {
    if (app.scrollAnimInit) return;
    app.scrollAnimInit = true;

    var observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    var animateElements = document.querySelectorAll('.c-card, .c-feature, .offer-card, .pricing-card, .why-card, .c-service-card, .c-benefit-card, .c-video-card, .c-achievement');
    
    for (var i = 0; i < animateElements.length; i++) {
      animateElements[i].style.opacity = '0';
      animateElements[i].style.transform = 'translateY(30px)';
      animateElements[i].style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
      observer.observe(animateElements[i]);
    }
  }

  function initRippleEffect() {
    if (app.rippleInit) return;
    app.rippleInit = true;

    var buttons = document.querySelectorAll('.c-button, .c-btn, button[type="submit"]');

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function(e) {
        var button = this;
        var ripple = document.createElement('span');
        var rect = button.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = 'position: absolute; width: ' + size + 'px; height: ' + size + 'px; border-radius: 50%; background: rgba(255,255,255,0.6); left: ' + x + 'px; top: ' + y + 'px; transform: scale(0); animation: ripple 0.6s ease-out; pointer-events: none;';

        var oldRipple = button.querySelector('span[style*="ripple"]');
        if (oldRipple) {
          oldRipple.remove();
        }

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(function() {
          ripple.remove();
        }, 600);
      });
    }

    var rippleStyle = document.createElement('style');
    rippleStyle.textContent = '@keyframes ripple { to { transform: scale(4); opacity: 0; } }';
    document.head.appendChild(rippleStyle);
  }

  function initCountUp() {
    if (app.countUpInit) return;
    app.countUpInit = true;

    var countElements = document.querySelectorAll('.countdown-value, .c-achievement__number, .pricing-card__amount');

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          var target = entry.target;
          var text = target.textContent;
          var number = parseInt(text.replace(/[^0-9]/g, ''));
          
          if (isNaN(number)) return;

          var prefix = text.match(/^[^0-9]*/)[0];
          var suffix = text.match(/[^0-9]*$/)[0];
          var duration = 2000;
          var steps = 60;
          var increment = number / steps;
          var current = 0;
          var stepDuration = duration / steps;

          target.textContent = prefix + '0' + suffix;

          var timer = setInterval(function() {
            current += increment;
            if (current >= number) {
              target.textContent = prefix + number + suffix;
              clearInterval(timer);
            } else {
              target.textContent = prefix + Math.floor(current) + suffix;
            }
          }, stepDuration);
        }
      });
    }, { threshold: 0.5 });

    for (var i = 0; i < countElements.length; i++) {
      observer.observe(countElements[i]);
    }
  }

  function initScrollToTop() {
    if (app.scrollTopInit) return;
    app.scrollTopInit = true;

    var button = document.createElement('button');
    button.innerHTML = '↑';
    button.style.cssText = 'position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--color-accent), var(--color-highlight)); color: #fff; border: none; font-size: 24px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 999; opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease; pointer-events: none;';
    button.setAttribute('aria-label', 'Scroll naar boven');
    document.body.appendChild(button);

    function toggleButton() {
      if (window.pageYOffset > 300) {
        button.style.opacity = '1';
        button.style.pointerEvents = 'auto';
      } else {
        button.style.opacity = '0';
        button.style.pointerEvents = 'none';
      }
    }

    button.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    button.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });

    window.addEventListener('scroll', throttle(toggleButton, 100));
    toggleButton();
  }

  function initModalPrivacy() {
    if (app.modalInit) return;
    app.modalInit = true;

    var privacyLinks = document.querySelectorAll('a[href*="privacy"]');
    
    for (var i = 0; i < privacyLinks.length; i++) {
      privacyLinks[i].addEventListener('click', function(e) {
        if (this.href.includes('privacy.html') && window.location.pathname !== '/privacy.html') {
          return;
        }
      });
    }
  }

  function initHeaderScroll() {
    if (app.headerScrollInit) return;
    app.headerScrollInit = true;

    var header = document.querySelector('.l-header');
    if (!header) return;

    var lastScroll = 0;

    function handleScroll() {
      var currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      } else {
        header.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      }

      lastScroll = currentScroll;
    }

    window.addEventListener('scroll', throttle(handleScroll, 100));
  }

  function initImageAnimations() {
    if (app.imageAnimInit) return;
    app.imageAnimInit = true;

    var images = document.querySelectorAll('img:not(.c-logo__img)');
    
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'scale(1)';
        }
      });
    }, { threshold: 0.1 });

    for (var i = 0; i < images.length; i++) {
      images[i].style.opacity = '0';
      images[i].style.transform = 'scale(0.95)';
      images[i].style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(images[i]);
    }
  }

  function initCardHoverEffects() {
    if (app.cardHoverInit) return;
    app.cardHoverInit = true;

    var cards = document.querySelectorAll('.c-card, .offer-card, .pricing-card, .c-service-card');

    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease-out';
      });
    }
  }

  app.init = function() {
    if (app.initialized) return;
    app.initialized = true;

    initBurgerMenu();
    initAnchors();
    initActiveMenu();
    initImages();
    initForms();
    initScrollAnimations();
    initRippleEffect();
    initCountUp();
    initScrollToTop();
    initModalPrivacy();
    initHeaderScroll();
    initImageAnimations();
    initCardHoverEffects();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }
})();
