var ajaxUtils = {/*site-wide ajax utility methods*/
    init: function (parent) {
        if (!$('#ajaxoverlay').length) {/*if the page doesn't already have the ajax overlay, add it*/
            $(parent).css({ 'position': 'relative' }); /*overlay's parent needs to be position:relative (should be done in css, but here just in case)*/
            $(parent).append('<div id="ajaxoverlay"><p id="ajaxmodal">Give us a second.<br>Processing your request...</p></div>');
            $('#ajaxoverlay').css({
                'height': $(parent).outerHeight(),
                'width': $(parent).outerWidth()
            });
            $('#ajaxoverlay').hide();
        }
    },
    wait: function () {
        var overlay = $('#ajaxoverlay');
        var parent = overlay.parent();
        overlay.css({
            'height': parent.outerHeight(),
            'width': parent.outerWidth()
        });
        overlay.show(); /*show the please wait overlay*/
    },
    done: function () {
        $('#ajaxoverlay').hide(); /*hide the please wait overlay*/
    },
    requestIt: function (options) {
        /*default settings*/
        var settings = {
            url: null, /*shouldn't be a default url (should ALWAYS be passed in)*/
            success: function () { }, /*shouldn't be a default success function (should ALWAYS be passed in)*/
            error: function () {
                msgUtils.showError(); /*if it errors out, show the error dialog*/
            },
            complete: function () {
                ajaxUtils.done(); /*when the ajax returns (regardless of success or error), hide the "please wait" message*/
            }
        };

        $.extend(settings, options); /*override the default settings with any that are passed in*/

        /*PLACEHOLDER BEGIN: This entire block is bogus and should be removed upon integration, just here as a placeholder to "slow down" the request so we can see the "please wait" message
        settings.success = function (html) {
        setTimeout(function () {
        options.success(html);
        }, 1000);
        };
        settings.error = function () {
        setTimeout(function () {
        msgUtils.showError();
        }, 1000);
        }
        settings.complete = function () {
        setTimeout(function () {
        ajaxUtils.done();
        }, 1000);
        };
        PLACEHOLDER END: Again, this entire block is bogus and should be removed upon integration*/

        ajaxUtils.wait(); /*show the "please wait" dialog*/
        $.ajax(settings); /*make the actual ajax call (using the result of the default/override settings)*/
    }
};

(function ($) {
    /*set inline styles to those in the css file, to prevent a "jumpy" first rollover*/
    $.fn.fixJump = function () {
        return this.each(function () {
            var t = $(this);
            t.css({ 'margin-top': t.css('margin-top') });
        });
    };
})(jQuery);

(function ($) {
    /*"roll up" to reveal the bottom bar on thumbnails*/
    $.fn.rollUp = function () {
        return this.each(function () {
            var s = $(this).find('span');
            $(this).find('img').stop().animate({
                'margin-top': '-' + s.outerHeight() + 'px'/*calculate the bar's height*/
            }, 200, 'easeInOutQuad');
        });
    };
    /*"roll down" to hide the bottom bar on thumbnails*/
    $.fn.rollDown = function () {
        return this.each(function () {
            $(this).find('img').stop().animate({
                'margin-top': '0'
            }, 200, 'easeInOutQuad');
        });
    };
    /*roll up on hover, roll down on unhover*/
    $.hoverRoll = function (selector) {
        $(document).delegate(selector, 'mouseenter', function (e) {
            $(this).rollUp();
        }).delegate(selector, 'mouseleave', function (e) {
            $(this).rollDown();
        });
    }
})(jQuery);

var $doc = $(document);
$doc.ready(function () {

    var msgUtils = {/*site-wide messaging (modal dialog) utility methods*/
        init: function (parent) {
            if (!$('#overlay').length) {/*if the page didn't start with the dialog open, add it in (but hide it)*/
                $(parent).css({ 'position': 'relative' }); /*overlay's parent needs to be position:relative (should be done in css, but here just in case)*/
                $(parent).append('<div id="overlay"><div id="modal"></div></div>');
                $('#overlay').hide();
            }
            $doc.delegate('#modal .close', 'click', function (e) {
                msgUtils.hideDialog();
            });
        },
        showDialog: function (msg, modal_class) {/*show modal dialog*/
            this.showDialogWithOverlayClass(msg, modal_class, '');
        },
        hideDialog: function () {/*hide modal dialog*/
            $('#overlay').hide(); /*hide the overlay (and the modal)*/
        },
        showDialogWithOverlayClass: function (msg, modal_class, overlay_class) {
            var modal = $('#modal');
            modal.removeClass().html(msg); /*set the modal dialog's content (remove any classes)*/
            if (modal_class) {
                modal.addClass(modal_class); /*if the dialog needs a special class, add it*/
            }
            var overlay = $('#overlay');
            if (overlay_class) {
                overlay.addClass(overlay_class);
            }
            var parent = overlay.parent();
            overlay.css({
                'height': parent.outerHeight(),
                'width': parent.outerWidth()
            });
            overlay.show(); /*show the overlay (and the modal)*/
        },
        showError: function (msg) {
            var message = '<h3><span>Sorry, but there was an error with your request.</span></h3><h3>Please fix the issues below and try again.</h3>';
            if (msg)
                message += '<p>' + msg + '</p>';
            message += '<h3>If the problem persists, please call our customer service line at 877-425-6665.</h3>';
            message += '<a href="#" class="close">Close</a>'; /*add on the close button*/
            msgUtils.showDialog(message, 'error'); /*show the error dialog*/
        }
    };

    $('[placeholder]').placeholder(); /*non html5 placeholder fallback*/

    $(function () {/*fancybox video*/
        /*automatically transforms youtube/vimeo href's into fancybox players for each*/
        var yt_regex = new RegExp(/watch\?v=/i); /*youtube regex*/
        var vim_regex = new RegExp(/([0-9])/i); /*vimeo regex*/
        var fancy_opt = {/*general fancybox settings (applies to both video types)*/
            'autoScale': false,
            'overlayColor': '#333',
            'overlayOpacity': '0.8',
            'padding': 0,
            'swf': {
                'allowfullscreen': 'true',
                'wmode': 'transparent'
            },
            'transitionIn': 'elastic',
            'transitionOut': 'elastic',
            'type': 'swf'
        };
        $doc.delegate('a.fancyvideo', 'click', function (e) {
            /*figure out if it's a youtube or vimeo link, merge the youtube/vimeo-specific settings into the general settings, pop open fancybox*/
            e.preventDefault();
            if (this.href.match(yt_regex)) {
                $.fancybox($.extend(fancy_opt, {
                    'height': 385,
                    'href': this.href.replace(yt_regex, 'v/') + '&autoplay=1',
                    'width': 640
                }));
            } else {
                $.fancybox($.extend(fancy_opt, {
                    'height': 360,
                    'href': this.href.replace(vim_regex, 'moogaloop.swf?clip_id=$1') + '&autoplay=1',
                    'width': 640
                }));
            }
        });
    });

    $(function () {/*home*/
        $('#homeform input:checked').parent().find('span').addClass('checked'); /*'check' the custom checkbox if the real checkbox was checked (on page load)*/

        $doc.delegate('#homeform .check span', 'click', function () {
            /*custom checkbox, user clicks span, we check the checkbox (hidden) and mark the span as checked (and vice versa)*/
            $(this).toggleClass('checked');
            $(this).parent().find('input').attr('checked', $(this).hasClass('checked'));
        });


        $doc.delegate('.home #sidebar .details', 'click', function (e) {
            e.preventDefault();
            $('#homeform').stop().fadeIn(500);
        });

        $doc.delegate('#homeformclose', 'click', function (e) {
            e.preventDefault();
            $('#homeform').stop().fadeOut(500); /*hide the form on close*/
        });

        var auto = null;
        $('.home #images a').first().addClass('curr');
        $('.home #caption a').first().addClass('curr');
        $('.home #images a:not(.curr)').show().hide(); /*trick jquery into thinking 'olddisplay' = block (on page load, so that first fadein isn't jumpy)*/
        $doc.delegate('.home #caption a', 'click auto', function (e) {
            /*cycle thru images (either on click or automatically via interval)*/
            e.preventDefault();
            if (auto && e.type === 'click') {
                /*stop auto-rotate after user clicks on any of the dots)*/
                clearInterval(auto);
                auto = null;
            }
            /*fade out the current image, fade in the next, mark the corresponding dot as current*/
            $('.home #caption .curr').removeClass('curr');
            var t = $(this).addClass('curr');
            var n = $('.home #images li:eq(' + t.parent().index() + ') a');
            n.css({ 'z-index': '1' }).fadeIn(500);
            /*slide the text down, change it, slide it back up
            $('.home #caption span').animate({ 'top': '2em' }, 500, function () {
            $(this).html(n.attr('alt')).animate({ 'top': '0' }, 500);
            });*/
            $('.home #images .curr').css({ 'z-index': '2' }).fadeOut(500, function () {
                $(this).removeClass('curr').css({ 'z-index': '0' });
                n.addClass('curr');
            });
        });
        auto = setInterval(function () {
            /*auto-rotate thru the 'images' items (trigger event on the dots)*/
            /*grab the dot after the current one (unless it's the end, then grab first)*/
            var next = $('.home #caption a.curr').parent().next();
            if (!next.length) {
                next = $('.home #caption li:first');
            }
            next.find('a').trigger('auto');
        }, 6000);
    });

    $(function () {/*collections*/
        /*fade the bg and hide the arrows (on page load)*/
        $('.home #collections .bg').css({ 'opacity': '.6' });

        $doc.delegate('.home #collections a', 'mouseenter', function () {
            var t = $(this).hasClass('collection') ? $(this) : $(this).next('.collection');
            t.find('.bg').stop().fadeTo(200, 1); /*fade in the bg*/
            t.stop().animate({/*slide up the text*/
                'padding-bottom': '22px',
                'padding-top': '18px'
            }, 200, 'easeInOutQuad');
        });

        $doc.delegate('.home #collections a', 'mouseleave', function () {
            var t = $(this).hasClass('collection') ? $(this) : $(this).next('.collection');
            /*fade out the bg, slide the text back down (after the arrow fades out)*/
            t.find('.bg').stop().fadeTo(200, 0.6);
            t.stop().animate({
                'padding-bottom': '20px',
                'padding-top': '20px'
            }, 200, 'easeInOutQuad');
        });
    });

    $(function () {/*featurebar*/
        /*fade the bg and hide the arrows (on page load)*/
        $('#featurebar .bg').css({ 'opacity': '.6' });
        $('#featurebar a .arrow span').hide();
        $doc.delegate('#featurebar a', 'mouseenter', function () {
            var t = $(this);
            t.find('.bg').stop().fadeTo(200, 1); /*fade in the bg*/
            t.stop().animate({/*slide up the text*/
                'padding-bottom': '16px',
                'padding-top': '14px'
            }, 200, 'easeInOutQuad', function () {
                t.find('.arrow span').stop(true, true).fadeIn(150); /*fade in the arrow (after the text slides up/bg fades in)*/
            });
        });

        $doc.delegate('#featurebar a', 'mouseleave', function () {
            var t = $(this);
            t.find('.arrow span').stop(true, true).fadeOut(150, function () {/*fade out the arrow*/
                /*fade out the bg, slide the text back down (after the arrow fades out)*/
                t.find('.bg').stop().fadeTo(200, 0.6);
                t.stop().animate({
                    'padding-bottom': '10px',
                    'padding-top': '20px'
                }, 200, 'easeInOutQuad');
            });
        });
    });

    $(function () {/*help icons*/
        /*dynamically insert the tooltip div (for the help hovers)*/
        var tip = $('<div id="tooltip">');
        var helpwrap = $('.has-help');
        helpwrap.append(tip.hide());
        $doc.delegate('.help', 'mouseenter', function (e) {
            /*show tooltip on help hover*/
            var t = $(this);
            /*add the green border around the box, toggle the help icon's hover state*/
            t.closest('li').addClass('tip');
            t.addClass('hover');
            /*position the tooltip based on the help icon's position (and fill the tooltip with the help icon's text)*/
            var position = t.offset();
            var helpwrappos = helpwrap.offset();
            var cushion

            if (t.hasClass('left')) {
                cushion = (tip.width() + 20) * -1;
            } else {
                cushion = 20;
            }


            tip.html(t.html()).css({
                'left': (position.left - helpwrappos.left + cushion) + 'px',
                'top': (position.top - helpwrappos.top - 5) + 'px'
            }).show();
        });

        $doc.delegate('.help', 'mouseleave', function (e) {
            /*remove border from text box, revert help icon to default state*/
            $(this).removeClass('hover').closest('li').removeClass('tip');
            /*hide the tooltip*/
            tip.hide();
        });
    });

    $(function () {/*slider (step1 & explore collection)*/
        var slider = $('#slider');
        var filter = $('#filter:not(.static)'); /*if filter (top links) has 'static' class, they work as normal links (no js interactivity)*/
        var subfilter = $('#subfilter'); /*subfilter (bottom thumbnails)*/
        var count = subfilter.find('li').length; /*how many thumbs in subfilter?*/
        subfilter.find('img').fixJump();
        var prev = $('#sliderprev');
        var next = $('#slidernext');
        $doc.delegate('#filter:not(.static) a:not(.static), #subfilter a', 'click', function (e) {
            e.preventDefault();
            var t = $(this);
            if (!t.hasClass('curr')) {
                /*get current and new index*/
                var index; /*index of new thumbnail*/
                var curr = subfilter.find('.curr').parent().index(); /*index of current thumbnail*/
                var category = t.attr('class').replace('curr', ''); /*grab the corresponding category class*/
                if (t.closest('ul').attr('id') === 'filter') {
                    index = subfilter.find('.' + category + ':first').parent().index(); /*if user clicked filter, grab index of the first thumbnail that belongs to that catg*/
                } else {
                    index = t.parent().index(); /*if user clicked subfilter, grab index of item clicked*/
                }
                /*adjust duration based on distance (longer the distance between the current and new thumbs, the longer the duration)*/
                var duration = 500 * Math.abs(curr - index);
                if (duration > 2000) {
                    duration = 2000; /*max out the duration (so that really long moves don't take forever)*/
                }
                /*toggle curr class*/
                if (filter.length) {
                    /*only alter the filter links if they aren't static*/
                    filter.find('.curr').removeClass('curr');
                    filter.find('a.' + category).addClass('curr');
                }
                /*animate the current and new thumbnails (and toggle the curr class)*/
                subfilter.find('.curr').removeClass('curr').rollDown(); /*make current thumb no longer current*/
                subfilter.find('li:eq(' + index + ') a').addClass('curr').rollUp(); /*make new thumb current*/
                /*slide slider (move based on index)*/
                slider.animate({
                    'margin-left': (-1080 * index) + 'px'
                }, duration, 'easeInOutQuad');
                /*recenter subfilter (if the subfilter is wider than the page, it'll need recentered to keep the current thumb on screen)*/
                if (count > 8) {
                    var margin;
                    if (index < 5) {
                        margin = 0; /*left align the subfilter thumbs*/
                    } else if (index < count - 4) {
                        margin = (-110 * (index - 4)) - 10; /*center the subfilter thumbs*/
                    } else {
                        margin = (-110 * (count - 9)) - 20; /*right align the subfilter thumbs when*/
                    }
                    /*slide the subfilter around based on the above calculated margin*/
                    subfilter.animate({
                        'margin-left': margin + 'px'
                    }, duration, 'easeInOutQuad');
                }
                /*toggle prev/next*/
                if (index === 0) {/*hide the prev arrow if user is on first item, show otherwise*/
                    prev.stop().fadeOut(500);
                } else {
                    prev.stop().fadeIn(500);
                }
                if (index === count - 1) {/*hide the next arrow if user is on last item, show otherwise*/
                    next.stop().fadeOut(500);
                } else {
                    next.stop().fadeIn(500);
                }
            }
        });

        $doc.delegate('#sliderprev, #slidernext', 'click', function (e) {
            e.preventDefault();
            /*handle prev/next arrow clicks (grab the current thumbnail and find the item before (or after) it and 'click' it)*/
            var t = subfilter.find('.curr').parent();
            if ($(this).attr('id') === 'sliderprev') {
                t = t.prev();
            } else {
                t = t.next();
            }
            if (t.length) {
                /*if there is a next/prev thumbnail (not already on the first/last thumbnail), 'click' it*/
                t.find('a').trigger('click');
            }
        });

        $.hoverRoll('#subfilter a:not(.curr)');

        /* click first item to make it active */
        subfilter.find('a').eq(0).click()
    });

    $(function () {/*step2*/
        var smallBusinessSegment = false;
        $('.small-business').hide();
        /*datepicker for subscription start date*/
        $('#onOrAfter').datepicker({
            minDate: '+' + $('#onOrAfter').attr('buffer')
        });

        $doc.delegate('#step2-form .radio label', 'click', function (e) {
            /*remove checked class from other labels (buttons), add to one clicked*/
            $(this).closest('ul').find('.checked').removeClass('checked');
            $(this).addClass('checked');
            $(this).next('input[type=radio]').attr('checked', true).change();
        });

        /*Show the promo for the first bouquet*/
        $('input[name=frequency]').change(function (e) {
            var visible;
            if (this.id === 'monthly') {
                $('#promo').html('&nbsp;');
            }
            else if (this.id === 'weekly') {
                $('#promo').html('First Bouquet Free');
                $('#promo').removeClass('promo-mid');
            } else if (this.id === 'every-other-week') {
                $('#promo').html('First Bouquet Free');
                $('#promo').addClass('promo-mid');
            }
            var visible = $('#step2-form label.term.' + this.id + '.valid').show();

            /*if previously checked item is still visible upon recipient change, do nothing, but otherwise select the first visible*/
            if (visible.filter('.checked').length === 0)
                visible.first().click();
        });

        /*toggle term options for personal and gift subscriptions (and label pronouns)*/
        $('input[name=recipient]').change(function (e) {
            var visible;
            if (this.id === 'personal' || this.id === 'small-business') {
                $('#step2-form label.main .pronoun').text('your');
                $('#step2-form label[for=ownVase]').text('I prefer to use my own vase and cut the stems myself.');
                $('#step2-form label[for=lobbyDrop]').text('Please leave the delivery at the front desk or with my doorman.');

                $('#step2-form label.term.gift').hide();
                $('#step2-form li.section li.auto-renew').hide();
                if (this.id === 'small-business') {
                    smallBusinessSegment = true;
                    $('.small-business-only').show();
                }
                else {
                    $('.small-business-only').hide();
                    if (smallBusinessSegment === true) {
                        smallBusinessSegment = false;
                    }
                }
            }
            else if (this.id === 'gift') {
                $('#step2-form label.main .pronoun').text('their');
                $('#step2-form label[for=ownVase]').text('They prefer to use their own vase and cut the stems themselves.');
                $('#step2-form label[for=lobbyDrop]').text('Please leave the delivery at the front desk or with their doorman.');

                $('#step2-form label.term.personal').hide();
                $('#step2-form li.section li.auto-renew').show();
                smallBusinessSegment = false;
                $('.small-business-only').hide();
            }
            var visibleTerm = $('#step2-form label.term.' + this.id + '.valid').show();

            /*if previously checked item is still visible upon recipient change, do nothing, but otherwise select the first visible*/
            if (visibleTerm.filter('.checked').length === 0)
                visibleTerm.first().click();

            $('.delivery-day.checked').click();
        });


        /*toggle term options for each frequency (only applies to gift, but note validity anyway in case a user toggles between personal and gift)*/
        $('input[name=frequency]').change(function (e) {
            $('#step2-form label.term').removeClass('valid').hide();
            var visible = $('#step2-form label.term.freq-' + $(this).val()).addClass('valid').filter('.' + $('input[name=recipient]:checked').attr('id')).show();

            /*if previously checked item is still visible upon recipient change, do nothing, but otherwise select the first visible*/
            if (visible.filter('.checked').length === 0)
                visible.first().click();
        });

        /*toggle window options for each day*/
        $('input[name=deliveryDay]').change(function (e) {
            $('#step2-form label.delivery-window').removeClass('valid').hide();
            $('#step2-form span.delivery-fee').hide();

            var visible;
            if (smallBusinessSegment) {
                visible = $('#step2-form label.delivery-window.day-' + $(this).val().toLowerCase()).addClass('valid').show();
                $('#step2-form span.delivery-window.day-' + $(this).val().toLowerCase()).show();
            }
            else {
                visible = $('#step2-form label.residential.delivery-window.day-' + $(this).val().toLowerCase()).addClass('valid').show();
                $('#step2-form span.residential.delivery-window.day-' + $(this).val().toLowerCase()).show();
            }


            /*if previously checked item is still visible upon day change, do nothing, but otherwise select the first visible*/
            if (visible.filter('.checked').length === 0)
                visible.first().click();

        });

        /*zip code handling*/
        if ($('#no-zip-entered').length > 0) {
            //            msgUtils.init('#step2-form > ul');
            msgUtils.init('#wrap');

            //Start div
            var modalHtml = '<div id="zip-modal">';

            //if there is a failure, display it, otherwise display opening message
            if ($('#zip-failure-reason').length > 0) {
                modalHtml += '<h4 class="failure bottom-margin">' + $('#zip-failure-reason').html() + '</h4>';
            } else {
                modalHtml += '<h4 class="bottom-margin">Please enter the zip code of the delivery address for your order</h4>';
            }

            //add zip input box
            modalHtml += '<input id="zip-input" type="text" maxlength="5" placeholder="Zip Code" class="bottom-margin" />';

            var marketOptions = $('#market-select-template').html();
            if (marketOptions && marketOptions != '') {
                //add separating text
                modalHtml += '<h4 class="bottom-margin">---- or ----</h4><h4 class="bottom-margin">Explore one of the cities we service</h4>';

                //add market dropdown
                modalHtml += '<select id="market-select">' + marketOptions + "</select>";
            }

            //add submit button and close div
            modalHtml += '<a id="zip-input-submit" class="flat-btn" href="#">Submit</a></div>';

            msgUtils.showDialogWithOverlayClass(modalHtml, 'white', 'white');
            $('#modal').css({ top: '30%' });
            $('#zip-input-form').submit(function (e) {
                e.preventDefault();

                $('#zip-input-submit').click();
            });

            $('#zip-input-submit').click(function (e) {
                e.preventDefault();

                var days = 365; // 1 year
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();

                var zip = $('#zip-input').val();
                var thankYouMessage;
                if (zip && zip != "") {
                    document.cookie = 'Zip=' + $('#zip-input').val() + expires + "; path=/";
                    thankYouMessage = 'Thanks for entering your zip code. Configuring options.';
                } else {
                    document.cookie = 'Market=' + $('#market-select').val() + expires + "; path=/";
                    thankYouMessage = 'Thanks for selecting a market. Configuring options.';
                }

                msgUtils.showDialogWithOverlayClass('<div id="zip-modal"><h4>' + thankYouMessage + '</h4></div>', 'white', 'white');
                document.location = document.location;
            });
        }
        else {
            $('#reset-zip').click(function (e) {
                e.preventDefault();

                var days = -1; // de-facto reset
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();

                document.cookie = 'Zip=' + $('#zip-input').val() + expires + "; path=/";
                document.cookie = 'Market=' + $('#market-select').val() + expires + "; path=/";
                document.location = document.location;
            });
        }

        $('a#use-new-zip').click(function (e) {
            e.preventDefault();

            var days = 365;
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();

            document.cookie = 'Zip=' + $(this).attr('zip') + expires + "; path=/";
            document.location = 'ChooseSchedule';
        });

        /*choice of delivery day should dictate what day of week is available in datepicker*/
        $('input[name=deliveryDay]').change(function (e) {
            var selectedDOW = $('input[name=deliveryDay]:checked').attr('idx');
            $('#onOrAfter').datepicker('option', 'beforeShowDay', function (date) {
                var day = date.getDay();
                return [day == selectedDOW, ''];
            });
        });

        /*initialize by firing the three event handlers, handling discrepancies between actually-selected radios and visually-selected ones due to caching*/
        if ($('input[name=deliveryDay]:checked').length == 0) {
            $('label.delivery-day').eq(0).click();
        }
        $('input[name=recipient]:checked').change();
        $('input[name=frequency]:checked').change();
        $('input[name=term]:checked').change();
        $('input[name=deliveryDay]:checked').change();

    });

    $(function () {/*step3*/
        var highlightPayment = function () {
            $('input[name = "PaymentProfileID"]').each(function () {
                if ($(this).is(':checked')) {
                    $(this).parent('li').addClass('selected-card');
                } else {
                    $(this).parent('li').removeClass('selected-card');
                }
            });
            if ($('#new-card-radio').is(':checked')) {
                $('#payment-info').slideDown(500);
            } else {
                $('#payment-info').slideUp(500);
            }
        };
        var highlightAddress = function () {
            $('input[name = "AddressID"]').each(function () {
                if ($(this).is(':checked')) {
                    $(this).parent('li').addClass('selected-address');
                } else {
                    $(this).parent('li').removeClass('selected-address');
                }
            });
            if ($('#new-address-radio').is(':checked')) {
                $('.new-address ul').slideDown(500);
            } else {
                $('.new-address ul').slideUp(500);
            }
        };
        if ($('#billing-same:checked').length) {
            /*hide the billing addr info on page load (if the billing is the same box is checked)*/
            $('#billing-info').hide();
        }
        if ($('li.existing-addresses').length && !$('#new-address-radio').is(':checked')) {
            /* if there are existing addresses, hide the new address form */
            $('.new-address ul').hide();
        }
        if ($('li.existing-cards').length && !$('#new-card-radio').is(':checked')) {
            /* if there are existing addresses, hide the new address form */
            $('#payment-info').hide();
        }
        $doc.delegate('#billing-same', 'click', function (e) {
            /*toggle the billing addr info when the billing is same box is (un)checked*/
            if ($(this).is(':checked')) {
                $('#billing-info').stop().slideUp(500);
            } else {
                $('#billing-info').stop().slideDown(500);
            }
        });
        $doc.delegate('input[name="AddressID"]', 'click', highlightAddress);
        $doc.delegate('input[name="PaymentProfileID"]', 'click', highlightPayment);
        $doc.delegate('ul.addresses > li', 'click', function (e) {
            $(this).children('input:radio').click(function (e) {
                e.stopPropagation(); // prevent endless loop on click
            }).click();
            highlightAddress();
            $(this).children('input:radio').click(highlightAddress); // then replace handler
        });
        $doc.delegate('ul.credit-cards > li', 'click', function (e) {
            $(this).children('input:radio').click(function (e) {
                e.stopPropagation(); // prevent endless loop on click
            }).click();
            highlightPayment();
            $(this).children('input:radio').click(highlightPayment); // then replace handler
        });

    });

    $(function () { /*step 4*/
        /* toggle promo box when 'I have a promotion code' is checked */
        if (!$('.step4 #have-promo:checked').length)
            $('.step4 .promo').hide();
        $doc.delegate('.step4 #have-promo', 'click', function (e) {
            if ($(this).is(':checked')) {
                $(this).parent().next('.promo').stop().slideDown(500);
            } else {
                $(this).parent().next('.promo').stop().slideUp(500);
            }
        });

        /* prevent double click */
        $doc.delegate('.step4 #submit-order', 'click', function (e) {
            e.preventDefault();
            $('#submit-order').attr('disabled', 'disabled');
            $('#submit-order').parents('form#confirm-details').submit();
            return false;
        });
    });

    $(function () {/*receipt*/
        $doc.delegate('#receipt #print-receipt', 'click', function (e) {
            e.preventDefault();
            window.print();
        });
    });

    $(function () {/*deals*/
        $('.deals .deadline').each(function () {
            var deadline = $(this);
            var deaddate = new Date(deadline.data('date'));
            var display = deadline.find('span');
            var countdown = setInterval(function () {
                var now = new Date();
                var diff = Math.floor((deaddate.valueOf() - now.valueOf()) / 1000);
                if (diff > 0) {
                    var secs = diff % 60;
                    var mins = Math.floor(diff / 60) % 60;
                    var hours = Math.floor(diff / 60 / 60) % 24;
                    var days = Math.floor(diff / 60 / 60 / 24);
                    var html = '';
                    if (days > 0) {
                        html += '<strong>' + days + ' day' + (days > 1 ? 's' : '') + '</strong>, ';
                    }
                    if (hours > 0) {
                        html += '<strong>' + hours + ' hour' + (hours > 1 ? 's' : '') + '</strong>, ';
                    }
                    if (mins > 0) {
                        html += '<strong>' + mins + ' minute' + (mins > 1 ? 's' : '') + '</strong>, ';
                    }
                    if (secs > 0) {
                        html += '<strong>' + secs + ' second' + (secs > 1 ? 's' : '') + '</strong>, ';
                    }
                    display.html(html.substring(0, html.length - 2));
                } else {
                    clearInterval(countdown);
                    countdown = null;
                    deadline.html('<strong>These deals have expired!</strong>');
                    deadline.nextUntil('.items').last().next('.items').find('.item .section .btn').remove();
                }
            }, 1000);
        });
    });

    $(function () {/*faq*/
        $('#faq dt').wrapInner('<span>'); /*throw spans in the dts so the clickable region is only the text (not the full width)*/
        $doc.delegate('#faq dt span', 'click', function (e) {
            e.preventDefault();
            var dt = $(this).parent();
            var dd = dt.next();
            if (dt.hasClass('open')) {
                /*remove open class from dt, hide the dd*/
                dt.removeClass('open');
                dd.slideUp(500);
            } else {
                /*add open class to dt, show the dd*/
                dt.addClass('open');
                /*slideDown is jumpy (because of margins/padding), instead we calculate the height it needs, and animate the height directly*/
                var h = dd.show().height(); /*show the dd and grab it's height*/
                dd.css({ 'height': '0' }).animate({ 'height': h }, 500, function () {
                    /*reset the height to zero, animate to the calculated height, then remove the explicit height declaration when done*/
                    dd.css({ 'height': '' });
                });
            }
        });
    });

    $(function () {/*what is hbloom*/
        $('#what-is input:checked').parent().find('span').addClass('checked'); /*'check' the custom checkbox if the real checkbox was checked (on page load)*/
        $doc.delegate('#what-is .check span', 'click', function () {
            /*custom checkbox, user clicks span, we check the checkbox (hidden) and mark the span as checked (and vice versa)*/
            $(this).toggleClass('checked');
            $(this).parent().find('input').attr('checked', $(this).hasClass('checked'));
        });

        $doc.delegate('#what-is .check input', 'click', function () {
            /*custom checkbox, user clicks real checkbox (via clicking the label), we must toggle the span as checked*/
            if ($(this).is(':checked')) {
                $(this).parent().find('span').addClass('checked');
            } else {
                $(this).parent().find('span').removeClass('checked');
            }
        });

        $doc.delegate('#what-is #formclose, #what-is #center a', 'click', function (e) {
            if ($(this).attr('href') === '#') {
                e.preventDefault();
                var slider = $('#what-is #inner');
                if ($(this).attr('id') === 'formclose') {
                    $('#what-is #center a').fadeIn(500, function () {
                        $('#what-is').addClass('right');
                    });
                    slider.stop().animate({ 'margin-left': '-240px' }, 500, 'easeInOutQuad');
                } else {
                    $(this).fadeOut(500, function () {
                        $('#what-is').removeClass('right');
                    });
                    slider.stop().animate({ 'margin-left': '0' }, 500, 'easeInOutQuad');
                }
            }
        });
    });

    $(function () {/*designers*/
        $doc.delegate('#designers #thumbs a:not(.curr)', 'mouseenter', function () {
            slide.up($(this));
        }).delegate('#designers #thumbs a:not(.curr)', 'mouseleave', function () {
            slide.down($(this));
        });
        var slide = {/*designers thumbs up/down animations*/
            /*NOTE: when jquery animates two or more elements, the steps (keyframes) of the animation are always different (even if it's the same property over the same distance/time). to fix this, we create (and animate) a new (fake) element and set the properties of the real elements manually for each step (keyframe), this way the animation runs off one set of keyframes instead of two*/
            up: function (elem) {
                var slide = elem.find('img, .text, .border').stop(); /*grab everything that slides up (photo, text, border)*/
                var text = elem.find('.text').stop();
                if (!$.browser.msie) {
                    text.show().css({ 'opacity': '1' }); /*grab the text (and force it to show at full opacity: to ensure fade starts/end properly)*/
                } else {
                    text.hide();
                }
                $('<p>').animate({ 'top': '1px' }, {
                    /*animate from 0 to 1 to use as %, manually set real elements' properties (to prevent jitter, see NOTE above)*/
                    duration: 200,
                    easing: 'easeInOutQuad',
                    step: function (step) {
                        slide.css({ 'margin-top': (-10 * step) + 'px' }); /*slide up the bar and images (photo and text)*/
                        if (!$.browser.msie) {
                            text.css({ 'opacity': 1 - step }); /*fade out the text*/
                        }
                    }
                });
            },
            down: function (elem) {
                var slide = elem.find('img, .text, .border').stop(); /*grab everything that slides down (photo, text, border)*/
                var text = elem.find('.text').stop();
                if (!$.browser.msie) {
                    text.show().css({ 'opacity': '0' }); /*grab the text (and force it to show at full transparency: to ensure fade starts/end properly)*/
                } else {
                    text.show();
                }
                $('<p>').animate({ 'top': '1px' }, {
                    /*animate from 0 to 1 to use as %, manually set real elements' properties (to prevent jitter, see NOTE above)*/
                    duration: 200,
                    easing: 'easeInOutQuad',
                    step: function (step) {
                        slide.css({ 'margin-top': -(10 - (10 * step)) + 'px' }); /*slide down the bar and images (photo and text)*/
                        if (!$.browser.msie) {
                            text.css({ 'opacity': step }); /*fade in the text*/
                        }
                    }
                });
            }
        };

        if (!$.browser.msie) {
            $('#designers #gallery .text').show().hide(); /*trick jquery into thinking 'olddisplay' = block (on page load, so that first fadein isn't jumpy)*/
            $doc.delegate('#designers #gallery a', 'mouseenter', function () {
                $(this).find('.text').stop(true, true).fadeIn(400);
            }).delegate('#designers #gallery a', 'mouseleave', function () {
                $(this).find('.text').stop(true, true).fadeOut(400);
            });
        } else {
            $doc.delegate('#designers #gallery a', 'mouseenter', function () {
                $(this).find('.text').show();
            }).delegate('#designers #gallery a', 'mouseleave', function () {
                $(this).find('.text').hide();
            });
        }
    });

    $(function () {/*designer-profile*/
        var auto = null;
        $doc.delegate('#favs-controls a', 'click auto', function (e) {
            /*cycle thru 'my favorites' items (either on click or automatically via interval)*/
            e.preventDefault();
            if (auto && e.type === 'click') {
                /*stop auto-rotate after user clicks on any of the dots)*/
                clearInterval(auto);
                auto = null;
            }
            /*fade out the current favorite, fade in the next, mark the corresponding dot as current*/
            var t = $(this);
            $('#favs .curr').fadeOut(500, function () {
                $('#favs .curr, #favs-controls .curr').removeClass('curr');
                t.addClass('curr');
                $('#favs a:eq(' + t.parent().index() + ')').fadeIn(500, function () {
                    $(this).addClass('curr');
                });
            });
        });
        auto = setInterval(function () {
            /*auto-rotate thru the 'my favorites' items (trigger event on the dots)*/
            /*grab the dot after the current one (unless it's the end, then grab first)*/
            var next = $('#favs-controls a.curr').parent().next();
            if (!next.length) {
                next = $('#favs-controls li:first');
            }
            next.find('a').trigger('auto');
        }, 6000);
        $('#team').find('img').fixJump();

        $.hoverRoll('#team a:not(.curr)');
    });

    $(function () {/*corporate*/
        var logos = $('#clientswrap ul');
        var cnt = logos.find('li').length;
        var speed = 700;
        var enableIt = function (elem, enable) {/*enable/disable arrows*/
            if (enable) {
                elem.removeClass('disabled');
            } else {
                elem.addClass('disabled');
            }
        }
        if (cnt > 4) {/*no point in doing anything if there aren't enough logos*/
            var ul_w = 0; /*grab the width of the lis (including borders)*/
            logos.find('li:lt(4)').each(function () {
                ul_w += $(this).outerWidth();
            });
            var start = parseInt(logos.css('margin-left'), 10); /*grab the starting position*/
            var end = ((cnt - 4) / -4 * ul_w) + start; /*grab the ending position (when list is all the way to the left)*/
            var next = $('#clientsnext a');
            var prev = $('#clientsprev a');
            var margin;
            var locked = false;
            enableIt(next, true);
            enableIt(prev, false);
            $doc.delegate('#corporate #clientsprev a, #corporate #clientsnext a', 'click', function (e) {
                e.preventDefault();
                if (!locked && !$(this).hasClass('disabled')) {/*lock everything so it doesn't slide */
                    locked = true;
                    /*grab the current position and add/subtract margin to move it left/right*/
                    margin = parseInt(logos.css('margin-left'), 10);
                    if ($(this).parent().attr('id') === 'clientsprev') {
                        margin += ul_w;
                    } else {
                        margin -= ul_w;
                    }
                    logos.animate({
                        'margin-left': margin + 'px'
                    }, speed, 'easeInOutQuad', function () {
                        /*fade the next/prev arrows (if at start: fade prev, if at end: fade next)*/
                        enableIt(prev, margin !== start);
                        enableIt(next, margin !== end);
                        locked = false;
                    });
                }
            });

            var auto = null;
            $('#corporate #images img:not(.curr)').show().hide(); /*trick jquery into thinking 'olddisplay' = block (on page load, so that first fadein isn't jumpy)*/
            $doc.delegate('#corporate #caption a', 'click auto', function (e) {
                /*cycle thru images (either on click or automatically via interval)*/
                e.preventDefault();
                if (auto && e.type === 'click') {
                    /*stop auto-rotate after user clicks on any of the dots)*/
                    clearInterval(auto);
                    auto = null;
                }
                /*fade out the current image, fade in the next, mark the corresponding dot as current*/
                $('#corporate #caption .curr').removeClass('curr');
                var t = $(this).addClass('curr');
                var n = $('#corporate #images img:eq(' + t.parent().index() + ')');
                n.css({ 'z-index': '1' }).fadeIn(500);
                /*slide the text down, change it, slide it back up*/
                $('#corporate #caption span').animate({ 'top': '2em' }, 500, function () {
                    $(this).html(n.attr('alt')).animate({ 'top': '0' }, 500);
                });
                $('#corporate #images .curr').css({ 'z-index': '2' }).fadeOut(500, function () {
                    $(this).removeClass('curr').css({ 'z-index': '0' });
                    n.addClass('curr');
                });
            });
            auto = setInterval(function () {
                /*auto-rotate thru the 'images' items (trigger event on the dots)*/
                /*grab the dot after the current one (unless it's the end, then grab first)*/
                var next = $('#corporate #caption a.curr').parent().next();
                if (!next.length) {
                    next = $('#corporate #caption li:first');
                }
                next.find('a').trigger('auto');
            }, 6000);
        }
    });

    $(function () {/*custom collection*/
        var auto = null;
        $('#custom #images img:not(.curr)').show().hide(); /*trick jquery into thinking 'olddisplay' = block (on page load, so that first fadein isn't jumpy)*/
        $doc.delegate('#custom #caption a', 'click auto', function (e) {
            /*cycle thru images (either on click or automatically via interval)*/
            e.preventDefault();
            if (auto && e.type === 'click') {
                /*stop auto-rotate after user clicks on any of the dots)*/
                clearInterval(auto);
                auto = null;
            }
            /*fade out the current image, fade in the next, mark the corresponding dot as current*/
            $('#custom #caption .curr').removeClass('curr');
            var t = $(this).addClass('curr');
            var n = $('#custom #images img:eq(' + t.parent().index() + ')');
            n.css({ 'z-index': '1' }).fadeIn(500);
            /*slide the text down, change it, slide it back up*/
            $('#custom #caption span').animate({ 'top': '2em' }, 500, function () {
                $(this).html(n.attr('alt')).animate({ 'top': '0' }, 500);
            });
            $('#custom #images .curr').css({ 'z-index': '2' }).fadeOut(500, function () {
                $(this).removeClass('curr').css({ 'z-index': '0' });
                n.addClass('curr');
            });
        });
        auto = setInterval(function () {
            /*auto-rotate thru the 'images' items (trigger event on the dots)*/
            /*grab the dot after the current one (unless it's the end, then grab first)*/
            var next = $('#custom #caption a.curr').parent().next();
            if (!next.length) {
                next = $('#custom #caption li:first');
            }
            next.find('a').trigger('auto');
        }, 6000);
    });

    $(function () {/*beautiful things*/
        var hover = $('<div id="hover">');
        $('.beautiful-things #imgs').append(hover);
        $doc.delegate('.beautiful-things #imgs li li', 'mouseenter', function () {
            var pos = $(this).position();
            hover.hide().css({
                'left': pos.left,
                'opacity': '',
                'top': pos.top
            }).html($(this).html()).stop().fadeIn(250);
        }).delegate('.beautiful-things #hover', 'mouseleave', function () {
            hover.stop().fadeOut(250);
        });
    });

    $(function () {/*member home*/
        var initIt = function (content) {
            var utils = {
                /*methods for fading in, fading out, positioning tooltip, etc*/
                showTip: function () {
                    /*fade in tooltip (if needed)*/
                    if (!content.hasClass('picked')) {
                        if ($.browser.msie) {
                            tip.show();
                        } else {
                            tip.stop(true, true).fadeIn(500);
                        }
                    }
                },
                positionTip: function (e) {
                    /*position tooltip (if needed)*/
                    if (!content.hasClass('picked')) {
                        tip.css({
                            'left': (e.pageX - offset.left) + 'px',
                            'top': (e.pageY - offset.top) + 'px'
                        }).show();
                    }
                },
                hideTip: function () {
                    /*fade out tooltip (if needed)*/
                    if (!content.hasClass('picked')) {
                        if ($.browser.msie) {
                            tip.hide();
                        } else {
                            tip.stop(true, true).fadeOut(500);
                        }
                    }
                },
                updateHelpText: function () {
                    var sdId = $('.subscription.active > .tabs li > .curr').parent().attr('id').substring(4);
                    var sdElem = $('#' + sdId);
                    var numChoices = sdElem.children('a').size();
                    if (numChoices < 2) {
                        $('.subscription.active > .subscriptionHelpText').text('');
                    }
                    else {
                        $('.subscription.active > .subscriptionHelpText').text('You can choose a bouquet for this delivery!');
                    }
                },
                fadeIn: function (elem) {
                    /*fade in item and mark as 'onDeck' (see on/info hijacking below)*/
                    elem.stop().fadeTo(500, 1).addClass('onDeck');
                },
                fadeOut: function (elem) {
                    /*fade out item and remove it from 'onDeck'*/
                    elem.stop().fadeTo(500, 0.5).removeClass('onDeck');
                },
                /*fade buttons in/out (NOTE: IE can't handle png fading, so we just show/hide )*/
                fadeBtnsIn: function () {
                    /*fade buttons in*/
                    btns.change.fadeIn(pngfade);
                    btns.current.fadeIn(pngfade);
                },
                fadeBtnsOut: function () {
                    /*fade buttons out*/
                    btns.change.fadeOut(pngfade);
                    btns.current.fadeOut(pngfade);
                },
                cleanBtnsTxt: function () {
                    /*reset button text to original color and values*/
                    btns.change.css('color', '').text(btnsTxt.change);
                    btns.current.css('color', '').text(btnsTxt.current);
                }
            };
            var pngfade = ($.browser.msie) ? 0 : 500; /*IE can't handle png fading, so we set duration to 0 to make the fade instant*/
            var choices = content.find('.choice1, .choice2');
            var btns = {
                change: content.find('.btn-change'),
                current: content.find('.btn-current')
            };
            var btnsTxt = {
                change: btns.change.text(),
                current: btns.current.text()
            };
            var tip = $('<div class="btn-tooltip">');
            content.append(tip);
            var offset = content.offset();

            /*bind and delegate listeners to each content elem, instead of the document (so the content's listeners don't conflict w/ another content's listeners)*/
            content.bind('mouseover', function (e) {
                /*mouseover stage: position and show tooltip*/
                offset = $(this).offset(); /*recalculate the offset (changes as user navigates tabs and slides everything left/right)*/
                utils.positionTip(e);
                utils.showTip();
            }).bind('mousemove', function (e) {
                /*mousemoves around stage: tooltip follows*/
                utils.positionTip(e);
            }).bind('mouseleave', function (e) {
                /*mouseleave stage: 1) if haven't picked: hide tooltip and unfade both items 2) if have picked: unfade picked and fade other*/
                if (!$(this).hasClass('picked')) {
                    utils.hideTip();
                    utils.fadeIn(content.find('.choice1, .choice2'));
                } else {
                    utils.fadeOut(content.find('.choice1, .choice2').not('.picked'));
                    utils.fadeIn(content.find('.picked'));
                }
            });

            content.delegate('.choice1, .choice2', 'mouseenter', function () {
                var t = $(this);
                if (!t.hasClass('locked')) {
                    /*mouseover either item: hovered item unfades, other item fades*/
                    utils.fadeOut(choices.not(t));
                    utils.fadeIn(t);
                }
            });

            content.delegate('.or, .info', 'click', function (e) {
                var t = $(event.target);
                if (!t.hasClass('skipped')) {
                    /*user clicks or/info: trigger the "onDeck" item's click (or/info is absoluted on top of current (unfaded) item and will hijack the click)*/
                    e.preventDefault();
                    choices.filter('.onDeck').trigger('click');
                }
            });

            content.delegate('.choice1, .choice2', 'click', function (e) {
                /*click either item: 1) if haven't picked: hide tooltip and "or" 2) always: fade in/out current/change buttons */
                e.preventDefault();
                var t = $(this);
                if (!t.hasClass('locked')) {
                    var first = !content.hasClass('picked'); /*has the user picked yet?*/
                    if (first) {
                        utils.hideTip();
                        content.addClass('picked');
                        content.find('.or').stop().fadeOut(pngfade);
                        $(t).append(btns.change);
                        choices.not(t).append(btns.current);
                        btns.change.fadeIn(pngfade);
                    }
                    if (!t.hasClass('picked')) {/*don't do anything if the user clicks the current (picked) item again*/
                        var btn = t.children('span');
                        btn.css('color', '').text('Loading...'); /*reset color in case it was previously an error msg*/

                        /*submit the vote*/
                        var svo = this.id.substring(4);
                        var sd = t.parent('li').attr('id').substring(3);
                        $.post('/Account/VoteForDelivery/' + sd, { 'svo': svo }, function (data) {
                            /*on success, mark the clicked item as picked and give it the current selection button, mark the other item as not picked and give it the change button*/
                            if (data.success === 'true') {
                                btns.change.stop(true, true); /*just in case, guards against flickering*/
                                utils.fadeBtnsOut();
                                /*delay so the full fade out can happen first*/
                                setTimeout(function () {
                                    $(t).addClass('picked').append(btns.current);
                                    choices.not(t).removeClass('picked').append(btns.change);
                                    utils.fadeBtnsIn();
                                    utils.cleanBtnsTxt();
                                }, pngfade);
                            }
                            else
                                btn.css('color', '#ff0060').text(data.message);
                        });
                    }
                    t.parents('.subscription').find('.curr .done').fadeIn(pngfade);
                }
            });

            utils.updateHelpText();
        };
        $('.member-home .tabcontent li').each(function () {
            initIt($(this)); /*init each tab separately (so they don't conflict with each other)*/
            $(this).mouseenter().mouseleave();
        });

        $doc.delegate('.member-home .tabs a', 'click', function (e) {
            e.preventDefault();
            var curr_idx = $(this).closest('li').siblings('li').find('.curr').removeClass('curr').closest('li').index(); /*get index of old current tab (and unmark it as current)*/
            var idx = $(this).addClass('curr').closest('li').index(); /*get index of clicked tab (and mark it as current)*/
            var duration = 1000 * Math.abs(curr_idx - idx); /*calculate duration based on distance*/
            if (duration > 3000) {
                duration = 3000; /*max out the duration (so that really long moves don't take forever)*/
            }
            /*slide everything*/
            $(this).closest('ul').next('.tabcontent').find('ul').animate({
                'margin-left': (idx * -980) + 'px'
            }, duration, 'easeInOutQuad');

            var sdId = $('.subscription.active > .tabs li > .curr').parent().attr('id').substring(4);
            var sdElem = $('#' + sdId);
            var numChoices = sdElem.children('a').size();
            if (numChoices < 2) {
                $('.subscription.active > .subscriptionHelpText').text('');
            }
            else {
                $('.subscription.active > .subscriptionHelpText').text('You can choose a bouquet for this delivery!');
            }
        });

        /*accordion for different collections*/
        $('.member-home #subscription-select select').change(function (e) {
            var selected = $(this);
            selected.parent().siblings('.subscription').removeClass('active').filter('#subscription-' + selected.val()).addClass('active');
        });
        $('.member-home .subscription .collection a').click(function (e) {
            e.preventDefault();
            var thisCollection = $(this).parents('.subscription');
            thisCollection.siblings('.subscription').children('.collection').removeClass('active').end().removeClass('active', 'slow');
            thisCollection.children('.collection').addClass('active').end().addClass('active', 'slow');
        });

        /*video promo-specific js (dim the play icon on mouseenter/leave)*/
        var icon = $('.member-home #video .icon').fadeTo(0, 0.8);
        $doc.delegate('.member-home #video', 'mouseenter', function () {
            icon.stop().fadeTo(500, 1);
        }).delegate('.member-home #video', 'mouseleave', function () {
            icon.stop().fadeTo(500, 0.8);
        });
    });

    $(function () {/*my account*/
        $doc.delegate('#overview li a', 'hover', function () {
            /*when user hovers the link (or button) in the overview, highlight the entire li*/
            var parent = $(this).closest('li');
            if (parent.hasClass('hold')) {
                parent.toggleClass('hover-hold'); /*services on hold get a different style*/
            } else {
                parent.toggleClass('hover');
            }
        });

        $doc.delegate('#overview select', 'change', function () {
            $(this).closest('form').submit(); /*submit the form*/
        });
    });

    $(function () {/*my services*/
        var feature;
        var pending_close = false;

        $('.my-services #slider a img').fixJump();
        $.hoverRoll('.my-services #info a.img:not(.selected)');
        $.hoverRoll('.my-services #slider a:not(.selected)');

        msgUtils.init('#tabcontent');

        $doc.delegate('.my-services #infotabs a', 'click', function (e) {/*tabs*/
            e.preventDefault();
            var t = $(this);
            if (!t.hasClass('disabled') && !t.hasClass('curr') && !feature.hasClass('skipped')) {/*ignore if tab already open or entire feature marked as skipped*/
                if (t.hasClass('change'))
                    utils.open(t); /*open the corresponding tab content*/
                if (t.hasClass('skip')) {
                    /*if it's the skip tab, we also need to mark the delivery as skipped*/
                    utils.markSkipped(true);
                } else if (t.hasClass('options')) {
                    /*hide any old "saved successfully" message*/
                    $('.my-services #msg-save').hide();
                }
            } else if (t.hasClass('skip') && !t.hasClass('disabled')) {/*unless user clicked the "skip/restore" tab*/
                /*restore the delivery by "clicking" the restore button inside the tab's content*/
                $('.my-services #skip a').trigger('click');
            }
            if (t.hasClass('shift') && !t.hasClass('disabled') && !feature.hasClass('skipped')) {
                utils.toggleShiftDeliveryMode();
            }
        });

        $doc.delegate('.my-services #feature .close', 'click', function (e) {/*tab close buttons*/
            e.preventDefault();
            utils.close(); /*close the open tab*/
        });

        $doc.delegate('.my-services #skip a', 'click', function (e) {/*restore button*/
            e.preventDefault();
            utils.close(); /*close the tab*/
            utils.markSkipped(false); /*mark the delivery as no longer skipped*/
        });

        $doc.delegate('.my-services #btn-save', 'click', function (e) {/*options tab save button*/
            e.preventDefault();
            pending_close = true; /*setup a pending close*/
            /*show the "saved" successfully message, wait a bit, fade it out, and then close the tab*/
            $('.my-services #msg-save').show().delay(2000).fadeOut(500, function () {
                /*don't close if tab is closed by another action (or if user switched tabs) - these actions will reset the "pending_close" elsewhere*/
                if (pending_close) {
                    utils.close();
                }
            });
        });

        $doc.delegate('.my-services #info .img', 'click', function (e) {/*change selection tab thumbnails*/
            e.preventDefault();
            var t = $(this);
            if (!t.hasClass('selected') && !t.hasClass('frozen')) {/*only change selected thumb if user clicks on the unchoosen thumb*/
                /*submit the vote*/
                var svo = this.id.substring(4);
                var sd = t.parentsUntil('.section').parent().attr('id').substring(3);
                $.post('/Account/VoteForDelivery/' + sd, { 'svo': svo }, function (data) {
                    /*on success, mark the clicked item as picked and give it the current selection button, mark the other item as not picked and give it the change button*/
                    if (data.success === 'true') {
                        var selected = $('.my-services #info .selected'); /*grab the selected thumb*/
                        selected.find('span').html('Choose'); /*change it's label*/
                        selected.removeClass('selected').rollDown(); /*unmark it as selected*/
                        t.addClass('selected').find('span').html('Selected'); /*mark new thumb as selected*/

                        /*update copy*/
                        var intro = feature.find('.intro strong');
                        intro.text(intro.text().replace('You have not made your', 'This is your'));

                        pending_close = true; /*setup a pending close*/
                        setTimeout(function () {/*wait a bit, then close the tab, then swap out the old big image for the new big image*/
                            /*don't close if tab is closed by another action (or if user switched tabs) - these actions will reset the "pending_close" elsewhere*/
                            if (pending_close) {
                                utils.close();
                            }
                            /*grab the big image, wait a bit, fade it out*/
                            var selectedBig = feature.children('.selected').length ? feature.children('.selected') : feature.children().eq(1); // take the 2nd image by default since it'll be on top
                            selectedBig.delay(450).fadeOut(500, function () {
                                /*after the old big image is gone, mark the new big image as selected*/
                                feature.find('> img').addClass('selected');
                                $(this).removeClass('selected').css({ 'opacity': '' }).show(); /*reset so user can keep switching back and forth*/
                            });
                        }, 1000);
                    }
                    else
                        msgUtils.showError();
                });
            }
        });

        $doc.delegate('.my-services thead a', 'click', function (e) {/*calendar arrows*/
            e.preventDefault();
            ajaxUtils.requestIt({
                url: $(this).attr('href') + '?month=' + $(this).attr('month') + '&day=' + $(this).attr('day') + '&year=' + $(this).attr('year') + '&shiftDeliveryMode=' + $(this).attr('shift-delivery-mode') + ($(this).attr('delivery-id') ? '&deliveryId=' + $(this).attr('delivery-id') : ''), /*load in the new month (use the href of the arrow)*/
                success: function (html) {
                    $('.my-services table').replaceWith(html); /*replace the calendar*/
                    deliveries.init();
                }
            });
        });

        $doc.delegate('.my-services .shift-skip-delivery', 'click', function (e) {/*shift/skip button*/
            e.preventDefault();
            msgUtils.showDialog(
                '<h3>To Shift a Delivery to a Different Day:</h3>' +
                '<ol>' +
                '<li>Select the date you want to shift in the calendar</li>' +
                '<li>Click "Shift This Delivery" above the calendar</li>' +
                '<li>Selectable dates appear in blue</li>' +
                '<li>Confirm shifted date by clicking yes</li>' +
                '</ol>' +
                '<h3>To Skip an Individual Delivery:</h3>' +
                '<ol>' +
                '<li>Select the date you want to skip in the calendar</li>' +
                '<li>Click "Skip This Delivery" above the calendar</li>' +
                '<li>Delivery will appear in red to indicate skipped delivery</li>' +
                '</ol>' +
                '<a href="#" class="close">Close</a>', '');
        });

        $doc.delegate('.my-services .hold-service', 'click', function (e) {/*hold button*/
            e.preventDefault();
            utils.markOnHold(true); /*mark the entire service as on hold*/
        });

        $doc.delegate('.my-services #msg-reactivate', 'click', function (e) {/*reactivate (unhold) button */
            e.preventDefault();
            utils.markOnHold(false); /*reactivate the entire service*/
        });

        $doc.delegate('.my-services .cancel-service', 'click', function (e) {/*cancel button (popup with options)*/
            e.preventDefault();
            msgUtils.showDialog(
                '<h3>Are you sure you want to cancel?</h3>' +
                '<h4>Shift or skip a delivery instead</h4>' +
                $('.my-services .shift-skip-delivery')[0].outerHTML +
                '<br />' +
                '<h4>Temporarily pause this service</h4>' +
                $('.my-services .hold-service')[0].outerHTML +
                '<br /><br />' +
                '<h4>Yes, I\'d like to cancel</h4>' +
                '<a class="btn" id="cancel-service" href="#" subscription-id="' + $('.my-services .cancel-service').attr('subscription-id') + '">Cancel This Service</a>' +
                '<a href="#" class="close">Close</a>', '');
        });

        $doc.delegate('.my-services #cancel-service', 'click', function (e) {/*inner cancel button (actual cancellation) */
            e.preventDefault();
            utils.cancelService(); /*cancel the entire service*/
        });

        $doc.delegate('.my-services #submit-cancel-reason', 'click', function (e) {/*submit cancellation reason button*/
            e.preventDefault();
            utils.submitCancelReason();
        });

        $doc.delegate('.my-services #left .edit', 'click', function (e) {/*show/hide edit areas*/
            e.preventDefault();
            var section = $(this).closest('li'); /*grab the section*/
            section.toggleClass('open'); /*toggle the "open" class for the section*/
            section.find('.sectionHeader').toggle();
            section.find('.extra').slideToggle(500); /*slide open/close the extra info for the section*/
        });

        $doc.delegate('.my-services #gift-message-content .btn', 'click', function (e) { /*update gift message*/
            e.preventDefault();
            $.ajax({
                type: "POST",
                url: "/Account/UpdateGiftMessage",
                data: {
                    deliveryId: $('#deliveryId').val(),
                    giftMessage: $(this).siblings('textarea').val()
                },
                success: function () {
                    msgUtils.showDialog('Your gift message has been successfully changed!<a href="#" class="btn">OK</a><a href="#" class="close">Close</a>', '');
                    $('#modal .btn').click(function (e) {
                        e.preventDefault();
                        $('#gift-message-content .btn').text("Update");
                        $('#modal .close').trigger('click');

                    });
                    //window.location = window.location;
                },
                error: function (jXhr, data, msg) {
                    msgUtils.showError(data.message);
                }
            });
        });

        $(function () {/*slider*/
            var slider = $('#slider'); /*grab the slider*/
            var margin = parseInt(slider.css('margin-left'), 10); /*get the slider's current margin*/
            var slides = slider.find('li'); /*find all of the slides*/
            var slide_w = slides.outerWidth(); /*get the width of one of the slides*/
            var slider_w = (slides.length - 4) * slide_w; /*calcuate the max distance the slider can move*/
            var step = slide_w * 2; /*how much to move the slider each time*/
            var prev = $('#sliderprev'); /*grab the previous arrow*/
            var next = $('#slidernext'); /*grab the next arrow*/

            $doc.delegate('.my-services #sliderprev, .my-services #slidernext', 'click', function (e) {/*edit collection slider arrows*/
                e.preventDefault();
                prev.show(); /*show previous*/
                next.show(); /*show next*/
                if ($(this).attr('id').match('prev')) {
                    /*if user clicks previous arrow, move the slider right*/
                    margin += step;
                    if (margin >= 0) {/*don't let the slider pass the left edge*/
                        margin = 0;
                        prev.hide(); /*hide previous arrow*/
                    }
                } else {
                    /*if user clicks next arrow, move the slider left*/
                    margin -= step;
                    if (margin <= -slider_w) {/*don't let the slider pass the right edge*/
                        margin = -slider_w;
                        next.hide(); /*hide next arrow*/
                    }
                }
                $('#slider').stop().animate({ 'margin-left': margin + 'px' }, 500); /*slide the slider*/
            });

            $doc.delegate('.my-services #slider a:not(.selected)', 'click', function (e) {/*edit collection thumbs*/
                e.preventDefault();
                var t = $(this); /*grab the new thumb*/

                var params = {
                    subscriptionId: t.attr('subscription-id'),
                    subscriptionProductLineId: t.attr('subscription-product-line-id'),
                    confirmedPriceChange: false
                };
                $.post('/Account/ChangeCollection', params, function (data) {
                    if (data.success === 'true') {
                        if (data.message) {
                            msgUtils.showDialog('<p>' + (parseInt(data.message) > 0 ? 'You will be charged an additional $' + parseFloat(data.message).toFixed(2) + ' per delivery for any upcoming deliveries.' : 'You will be charged $' + parseFloat(Math.abs(data.message)).toFixed(2) + ' less per delivery for any upcoming deliveries. Future prepaid deliveries will be refunded this same amount accordingly.') + ' Make this change?</p><a href="#" class="btn">Confirm</a><a href="#" class="close">Close</a>', '');
                            $('#modal .btn').click(function (e) {
                                params.confirmedPriceChange = true;
                                $.post('/Account/ChangeCollection', params, function (data) {
                                    if (data.success === 'true') {
                                        var selected = $('.my-services #slider a.selected'); /*grab the old current thumb*/
                                        selected.find('span').html('Choose'); /*change the old thumb's label*/
                                        selected.removeClass('selected').rollDown(); /*unmark the old thumb as selected*/
                                        t.addClass('selected').find('span').html('Selected'); /*mark the new thumb as selected (and change it's label)*/

                                        msgUtils.showDialog('Your collection has been successfully changed! Reloading...', '');
                                        $('#selectSub').submit();
                                    }
                                    else
                                        msgUtils.showError(data.message);
                                });
                            });
                        }
                        else {
                            var selected = $('.my-services #slider a.selected'); /*grab the old current thumb*/
                            selected.find('span').html('Choose'); /*change the old thumb's label*/
                            selected.removeClass('selected').rollDown(); /*unmark the old thumb as selected*/
                            t.addClass('selected').find('span').html('Selected'); /*mark the new thumb as selected (and change it's label)*/

                            msgUtils.showDialog('Your collection has been successfully changed! Reloading...', '');
                            $('#selectSub').submit();
                        }
                    }
                    else
                        msgUtils.showError(data.message);
                });
            });
        });
        var dayBtns = $('.my-services .btns #day a');
        dayBtns.click(function (e) {
            dayBtns.removeClass('selected');
            $(this).addClass('selected');
            var parentSelector = '.my-services .btns #delivery-window';
            $(parentSelector + ' a, ' + parentSelector + ' span').hide();
            var dayName = $(this).attr('id').toLowerCase();
            var visible = $(parentSelector + ' a.day-' + dayName + ', ' + parentSelector + ' span.day-' + dayName).show();

            //            /*if previously checked item is still visible upon day change, do nothing, but otherwise select the first visible*/
            //            if (visible.filter('.checked').length === 0)
            //                visible.first().click();
        });
        dayBtns.filter('.selected').click();

        $doc.delegate('.my-services #addr', 'change', function (e) {/*edit address*/
            e.preventDefault();
            var t = $(this); /*grab the select box*/

            var params = {
                subscriptionId: t.attr('subscription-id'),
                deliveryAddressId: t.val(),
                confirmedPriceChange: false
            };
            $.post('/Account/ChangeDeliveryAddress', params, function (data) {
                if (data.success === 'true') {
                    if (data.message) {
                        msgUtils.showDialog('<p>' + (parseInt(data.message) > 0 ? 'You will be charged an additional $' + parseFloat(data.message).toFixed(2) + ' per delivery due to differences in tax and shipping costs.' : 'You will be charged $' + parseFloat(Math.abs(data.message)).toFixed(2) + ' less per delivery due to differences in tax and shipping costs. Future prepaid deliveries will be refunded this same amount accordingly.') + ' Make this change?</p><a href="#" class="btn">Confirm</a><a href="#" class="close">Close</a>', '');
                        $('#modal .btn').click(function (e) {
                            params.confirmedPriceChange = true;
                            $.post('/Account/ChangeDeliveryAddress', params, function (data) {
                                if (data.success === 'true') {
                                    msgUtils.showDialog('Your delivery address has been successfully changed! Reloading...', '');
                                    $('#selectSub').submit();
                                }
                                else
                                    msgUtils.showError(data.message);
                            });
                        });
                    }
                    else { // auto-confirmed since no price change
                        msgUtils.showDialog('Your delivery address has been successfully changed! Reloading...', '');
                        $('#selectSub').submit();
                    }
                }
                else
                    msgUtils.showError(data.message);
            });
        });

        $doc.delegate('.my-services #payment', 'change', function (e) {/*edit payment*/
            /*NOTE: DP didn't design this edit payment section, just dropped in a temporary placeholder to demonstrate functionality*/
            e.preventDefault();
            var t = $(this); /*grab the payment select box*/
            var selected = t.find(':selected'); /*grab the selected item*/
            if (selected.hasClass('add')) {
                /*if user selected "add new", bounce them to the add new page*/
                window.location = window.location; /*PLACEHOLDER: just to get the page to refresh, need to do something like window.location = 'whatever.html'*/
            } else {
                /*if user selected an existing payment method*/
                /*NOTE: this is a placeholder ajax, url/querystrings/etc will need modified*/
                ajaxUtils.requestIt({
                    url: 'my-services.html',
                    success: function (html) {
                        var html = selected.text(); /*grab the text*/
                        t.closest('li.section').find('h4 span').html(html); /*update the section label*/
                    }
                });
            }
        });

        $doc.delegate('.my-services #is-gift', 'click', function (e) {/*disable/enable gift message textarea based on checkbox*/
            var textarea = $(this).closest('form').find('textarea'); /*grab the gift message textarea*/
            textarea.toggleClass('disabled').attr('disabled', !textarea.attr('disabled')); /*toggle disabled attr and disabled class*/
        });

        var utils = {
            init: function () {/*initialize*/
                feature = $('#feature'); /*grab the feature area (deliveries tabs)*/
                feature.find('#info .img img').fixJump();
                ajaxUtils.init('#right'); /*setup the right side for ajax in progress messages*/
            },
            open: function (tab) {/*open tab*/
                pending_close = false; /*cancel any pending tab closes (some tabs will autoclose after a save, don't want them to close this newly opened tab)*/
                /*animate down the old curr arrow*/
                tab.closest('ul').find('.curr').animate({
                    'margin-top': '0',
                    'padding-top': '0'
                }, 200, function () {
                    $(this).removeClass('curr');
                });
                /*animate up the new curr arrow*/
                tab.css({
                    'margin': '0',
                    'padding': '0'
                }).addClass('curr').animate({
                    'margin-top': '-7px',
                    'padding-top': '7px'
                }, 200);
                var idx = tab.closest('li').index(); /*grab the tab's index*/
                $('.my-services #infocontent').find('> p').fadeOut(500); /*fade out the intro text*/
                $('.my-services #infocontent').find('.close').fadeIn(500); /*fade in the close button*/
                $('.my-services #infocontent').animate({/*slide open the new tab*/
                    'height': (feature.height() - tab.height()) + 'px'
                }, 500);
                $('.my-services #infocontent').find('.section:not(' + idx + ')').fadeOut(500); /*fade out any old tabcontent*/
                $('.my-services #infocontent').find('.section:eq(' + idx + ')').fadeIn(500); /*fade in the new tabcontent*/
            },
            close: function () {/*close tab*/
                pending_close = false; /*cancel any pending tab closes (user physically closed tab, no need to autoclose)*/
                var p = $('.my-services #infocontent').find('> p'); /*grab the intro paragraph*/
                p.fadeIn(500); /*fade in the intro*/
                $('.my-services #infocontent').find('.section').fadeOut(500); /*fade out the old tabcontent*/
                $('.my-services #infocontent').animate({/*slide the tab down (instead of being full height, it should only be as tall as the intro paragraph)*/
                    'height': (p.outerHeight()) + 'px'
                }, 500);
                /*animate down the old tab arrow*/
                $('.my-services #info li .curr').animate({
                    'margin-top': '0',
                    'padding-top': '0'
                }, 200, function () {
                    $(this).removeClass('curr');
                });
            },
            markSkipped: function (skip) {/*(un)mark a single day as skipped*/
                var t = $('#infotabs .skip');
                var params = {
                    subscriptionDeliveryId: t.attr('subscription-delivery-id')
                };
                $.post('/Account/' + (skip ? 'Pause' : 'Reactivate') + 'SubscriptionDelivery', params, function (data) {
                    if (data.success === 'true') {
                        if (skip) {
                            utils.open(t);
                            feature.find('#infotabs .skip span').html('Restore this Delivery'); /*change the tab's label*/
                            feature.addClass('skipped'); /*mark the entire feature as skipped (disabled the other tabs)*/
                            $('#right table .curr a').removeClass('active').addClass('skip'); /*mark the current day in the calendar as skipped*/
                        }
                        else {
                            feature.find('#infotabs .skip span').html('Skip this Delivery'); /*change the tab's label*/
                            feature.removeClass('skipped'); /*mark the entire feature as unskipped (re-enables the other tabs)*/
                            $('#right table .curr a').removeClass('skip').addClass('active'); /*mark the current day in the calendar as unskipped*/
                        }
                    }
                    else
                        msgUtils.showError(data.message);
                });
            },
            markOnHold: function (hold) {/*(un)mark an entire service as on hold*/
                var params = {
                    subscriptionId: $('#left .hold-service').attr('subscription-id')
                };
                $.post('/Account/' + (hold ? 'Pause' : 'Reactivate') + 'Subscription', params, function (data) {
                    if (data.success === 'true') {
                        msgUtils.showDialog('Your subscription has been successfully ' + (hold ? 'paused' : 'reactivated') + '! Reloading...', '');
                        $('#selectSub').submit();
                    }
                    else
                        msgUtils.showError(data.message);
                });
            },
            cancelService: function () {/*cancel an entire service*/
                var params = {
                    subscriptionId: $('#cancel-service').attr('subscription-id')
                };
                $.post('/Account/CancelSubscription', params, function (data) {
                    if (data.success === 'true')
                        msgUtils.showDialog(
                            '<h4>Your account is now cancelled. Any pre-paid deliveries you\'ve not yet received will be refunded within two business days.</h4>' +
                            '<br /><br />' +
                            '<h4>We\'d love your feedback, can you let us know your reason for cancelling?</h4>' +
                            '<textarea id="cancel-reason"></textarea>' +
                            '<a class="btn" id="submit-cancel-reason" href="#" subscription-id="' + $('.my-services .cancel-service').attr('subscription-id') + '">Submit</a>');
                    else
                        msgUtils.showError(data.message);
                });
            },
            submitCancelReason: function () {/*submit a reason for cancellation*/
                var params = {
                    subscriptionId: $('#submit-cancel-reason').attr('subscription-id'),
                    cancellationReason: $('#cancel-reason').val()
                };
                $.post('/Account/SubmitSubscriptionCancellationReason', params, function (data) {
                    if (data.success === 'true') {
                        msgUtils.showDialog(
                            '<h4>Thanks for your feedback!</h4>');
                        document.location = '/Account/Services';
                    }
                    else
                        msgUtils.showError(data.message);
                });
            },
            updateDeliveries: function (tabs, calendar) {/*update deliveries section (top feature/tabs and/or calendar)*/
                /*NOTE: the urls here are just placeholders, will need to be updated (may need to update this function to accept urls as passed args, etc)*/
                if (tabs && calendar) {
                    /*update the entire right section (both the tabs and the calendar)*/
                    ajaxUtils.requestIt({
                        url: 'ajax/my-services.right.html',
                        success: function (html) {
                            $('.my-services #right').html(html); /*set the content of the entire right section to what the ajax returned*/
                            utils.init(); /*reintialize the tabs/tab content*/
                        }
                    });
                } else {
                    if (tabs) {
                        /*update just the tabs*/
                        ajaxUtils.requestIt({
                            url: 'ajax/my-services.featurewrap.html?day=10',
                            success: function (html) {
                                $('.my-services #featurewrap').html(html); /*set the content of the tabs to what the ajax returned*/
                                utils.init(); /*reintialize the tabs/tab content*/
                            }
                        });
                    } else if (calendar) {
                        /*update just the calendar*/
                        ajaxUtils.requestIt({
                            url: 'ajax/my-services.march.html',
                            success: function (html) {
                                $('.my-services table').html(html); /*set the content of the calendar to what the ajax returned*/
                            }
                        });
                    }
                }
            },
            toggleShiftDeliveryMode: function () {
                var shiftMode = $('input[name=shiftDeliveryMode]').val();
                if (shiftMode == true) {
                    deliveries.turnShiftModeOff();
                } else {
                    deliveries.turnShiftModeOn();
                }
            }
        };
        utils.init(); /*initialize the tabs/tab content*/

        $('#selectSub #subscriptionId').change(function () {
            $(this).parent().submit();
        });
    });

    $(function () {/*cart*/
        /*reposition the checkout button according to scroll position*/
        var checkout = $('#cart #cart-checkout');
        if (checkout.length) {
            var origPos = parseInt(checkout.css('top').replace('px', ''));
            $(window).scroll(function (event) {
                var offset = parseInt($(window).scrollTop() - $('#cart').find('form').offset().top);
                if (offset > 0) {
                    var maxPos = origPos + $('#cart-summary').height() - checkout.children('.content').outerHeight();
                    var newPos = parseInt(origPos + offset);
                    if (maxPos > newPos)
                        checkout.attr('class', 'float');
                    else
                        checkout.attr('class', 'bottom');
                }
                else
                    checkout.attr('class', 'top');
            });
        }
    });

    $(function () {/*authenticate*/
        // on change of any of the inputs in each of the two log in columns, auto-click the
        // radio button for that column and add the active class.  do not attach this change
        // event to the radio button itself - since, when clicked, it fires a change event 
        // itself and you end up in an endless loop.
        $('#authenticate').find('.column input[type!="radio"]').change(function (e) {
            $('#authenticate').find('.column').removeClass('active');
            $(this).parents('.column').addClass('active').find('.radioInput').click();
        });
        $('#authenticate').find('.column .radioInput:checked').change();

        $('#authenticate #email').blur(function (e) {
            var fve = $(this).next('.field-validation-error');
            if (!fve.length)
                fve = $(this).after('<span class="field-validation-error"></span>').next('.field-validation-error');

            var addr = $(this).val();
            if (addr.indexOf('@') != -1 && addr.length > 2)
                fve.remove();
            else
                fve.text('Email looks invalid.');
        });

        $('#authenticate #password').blur(function (e) {
            var fve = $(this).next('.field-validation-error');
            if (!fve.length)
                fve = $(this).after('<span class="field-validation-error"></span>').next('.field-validation-error');

            var pw = $(this).val();
            if (pw.length)
                fve.remove();
            else
                fve.text('You must specify a password.');
        });

        $('#authenticate #regPassword').blur(function (e) {
            var fve = $(this).next('.field-validation-error');
            if (!fve.length)
                fve = $(this).after('<span class="field-validation-error"></span>').next('.field-validation-error');

            var regPw = $(this).val();
            if (regPw.length > 5 && regPw.length < 16)
                fve.remove();
            else
                fve.text('Password must be 6 to 15 characters long.');
        });

        $('#authenticate #confirmPassword').blur(function (e) {
            var fve = $(this).next('.field-validation-error');
            if (!fve.length)
                fve = $(this).after('<span class="field-validation-error"></span>').next('.field-validation-error');

            var regPw = $('#regPassword').val();
            var confPw = $(this).val();
            if (confPw == regPw)
                fve.remove();
            else
                fve.text('Passwords don\'t match.');
        });

        $('#authenticate #firstName').blur(function (e) {
            var fve = $(this).next('.field-validation-error');
            if (!fve.length)
                fve = $(this).after('<span class="field-validation-error"></span>').next('.field-validation-error');

            var firstName = $(this).val();
            if (firstName.length)
                fve.remove();
            else
                fve.text('Your name is required.');
        });

        $('#authenticate #lastName').blur(function (e) {
            var fve = $(this).next('.field-validation-error');
            if (!fve.length)
                fve = $(this).after('<span class="field-validation-error"></span>').next('.field-validation-error');

            var lastName = $(this).val();
            if (lastName.length)
                fve.remove();
            else
                fve.text('Your name is required.');
        });

        $('#authenticate form').submit(function (e) {
            var mode = $(this).find('.column .radioInput:checked');
            if (!mode.length) {
                e.preventDefault();
                $("#formError").html('<span class="field-validation-error">Please select either Sign In or Register.</span>');
            }

            $(this).find('.column.active input').blur();
            var fve = $(this).find('.column.active .row .field-validation-error');
            if (fve.length) {
                e.preventDefault();
                fve.eq(0).prev().focus();
            }
        });
    });

    $(function () {/* confirm order */
        /*reposition the checkout button according to scroll position*/
        var checkout = $('#confirm-details #cart-checkout');
        if (checkout.length) {
            var origPos = parseInt(checkout.css('top').replace('px', ''));
            $(window).scroll(function (event) {
                var offset = parseInt($(window).scrollTop() - $('#confirm-details').offset().top);
                if (offset > 0) {
                    var maxPos = origPos + $('#order-details').height() - checkout.children('.content').outerHeight();
                    var newPos = parseInt(origPos + offset);
                    if (maxPos > newPos)
                        checkout.attr('class', 'float');
                    else
                        checkout.attr('class', 'bottom');
                }
                else
                    checkout.attr('class', 'top');
            });
        }
    });

    $(function () {/*my gifts & deals*/
        $('.member.gifts .zebra tbody tr:odd').addClass('shade');
    });

    $(function () { /*settings*/
        var highlightPayment = function () {
            if ($('#new-card-radio').is(':checked')) {
                $('div.newCard > div').slideDown(500);
            } else {
                $('div.newCard > div').slideUp(500);
            }
        };
        if ($('div.existingCard').length && !$('#new-card-radio').is(':checked')) {
            /* if there are existing addresses, hide the new address form */
            $('div.newCard > div').hide();
        }
        $doc.delegate('input[name="PaymentProfileID"]', 'click', highlightPayment);
        $doc.delegate('div.existingCard, div.newCard', 'click', function (e) {
            $(this).children('input:radio').click(function (e) {
                e.stopPropagation(); // prevent endless loop on click
            }).click();
            highlightPayment();
            $(this).children('input:radio').click(highlightPayment); // then replace handler
        });
        $('.member.settings #currentPassword').blur(function (e) {
            var fve = $(this).next('.field-validation-error');
            if (!fve.length)
                fve = $(this).after('<span class="field-validation-error"></span>').next('.field-validation-error');

            var pw = $(this).val();
            if (pw.length)
                fve.remove();
            else
                fve.text('You must enter your current password.');
        });

        $('.member.settings #newPassword').blur(function (e) {
            var fve = $(this).next('.field-validation-error');
            if (!fve.length)
                fve = $(this).after('<span class="field-validation-error"></span>').next('.field-validation-error');

            var regPw = $(this).val();
            if (regPw.length > 5 && regPw.length < 16)
                fve.remove();
            else
                fve.text('Password must be 6 to 15 characters long.');
        });

        $('.member.settings #confirmPassword').blur(function (e) {
            var fve = $(this).next('.field-validation-error');
            if (!fve.length)
                fve = $(this).after('<span class="field-validation-error"></span>').next('.field-validation-error');

            var regPw = $('#newPassword').val();
            var confPw = $(this).val();
            if (confPw == regPw)
                fve.remove();
            else
                fve.text('Passwords don\'t match.');
        });
    });

    $(function () {/*referrals*/
        $('.member.refer .zebra tbody tr:odd').addClass('shade');
    });

    $(function () {/*flash deals*/
        $('#wall-appeal a').click(function (e) {
            e.preventDefault();
            $('#wall .wall-section.front').removeClass('active');
            $('#wall .wall-section.back').addClass('active');
            $('#wall').addClass('back');
        });

        $('#wall-register a').click(function (e) {
            e.preventDefault();
            $('#wall .wall-section.back').removeClass('active');
            $('#wall .wall-section.front').addClass('active');
            $('#wall').removeClass('back');
        });

        $('#wall-mode').val() === 'register' ? $('#wall-appeal a').click() : $('#wall-register a').click();

        $('#wall-invite-status .status').each(function () {
            var status = $(this);
            if (status.text() === 'Awaiting Response')
                status.addClass('pending');
            else if (status.text() === 'Successfully Referred')
                status.addClass('success');
            else if (status.text() === 'Already a Member')
                status.addClass('failure');
        });
    });

    $(function () {/*product zoom*/
        var popup = $('#product-zoom');
        var popupContent = popup.children('.canvas').children('.content');

        /*close popup (close if clicked anywhere except inside content; note this essentially makes the close button decorative)*/
        popup.click(function (e) {
            popup.removeClass('active');
            popupContent.empty();
        });
        popupContent.click(function (e) {
            e.stopPropagation();
        });

        $('.product-zoom-button span').click(function (e) {
            popupContent.html('<img src="' + $(this).attr('data-href') + '" />');
            var image = popupContent.children('img');
            image.load(function (e) {
                popupContent.scrollLeft(Math.max((image.width() - popupContent.width()) / 2, 0)); // horizontally center zoom
                popupContent.scrollTop(Math.max((image.height() - popupContent.height()) / 2, 0)); // vertically center zoom
            });
            popup.addClass('active');
        });

        /*initialize popup content w/ jQuery kinetic*/
        popupContent.kinetic();
    });

    $(function () {/*header*/
        /*account menu*/
        $('#account-menu').click(function (e) {
            e.preventDefault();
            $(this).toggleClass('expand');
        });
        $('#account-menu-expand').click(function (e) {
            e.stopPropagation();
        });
    });

    $(function() { /* footer and careers galleries */
        var auto = setInterval(function() {
            $('.auto-gallery').trigger('auto');
        }, 4000);

        $('.auto-gallery').on('click autoclick', '.switcher li', function(e) {
            var li = $(this),
            gallery = li.closest('.auto-gallery'),
            index = li.index(),
            num = null;
            

            e.preventDefault();
            if(e.type === 'click')
                gallery.data('clicked', true);

            if(li.hasClass('active') || gallery.find(':animated').length)
                return;

            gallery.find('.slideshow-content .active').fadeOut(500, function() {
                if(gallery.find('.slideshow-content .active:animated').length)
                    return;

                gallery.find('.active').removeClass('active');
                li.addClass('active');
                gallery.find('.slideshow-content ul').each(function() {
                    $(this).find('li').eq(index).fadeIn(500, function() {
                        $(this).addClass('active');
                    });
                });
            });
        });

        $('.auto-gallery').on('auto', function(e) {
            var gallery = $(this),
            controlList = gallery.find('.switcher'),
            nextActive = null;

            if(gallery.data('clicked'))
                return;

            nextActive = (controlList.find('.active').index() + 1) % controlList.find('li').length;
            controlList.find('li').eq(nextActive).trigger('autoclick');
        });
    });

    $(function () {/*ie6*/
        if ($.browser.msie && $.browser.version === '6.0') {
            /*ie6 has trouble showing/hiding pngfixed elements directly, so we wrap the contents of the elem and apply the png bg (and pngfix) to the wrapper*/
            $('#fans .text').wrapInner('<div class="textbg">');
            /*toggle hover class for elements that don't support :hover in ie6*/
            $doc.delegate('#step2-form .radio label, button, .explore .item, #fans li', 'hover', function (e) {
                if ($(this).hasClass('btn')) {
                    $(this).toggleClass('btn-hover');
                } else {
                    $(this).toggleClass('hover');
                }
            });
        }
    });

    jQuery.fn.mailto = function () { /* mailto replace */
        return this.each(function () {
            var email = $(this).html().replace(/\s*\([^\)]+\)\s*/, "@");
            $(this).replaceWith('<a href="mailto:' + email + '" title="Email ' + email + '">' + email + '</a>');
        });
    };
    $(function () {
        $('a.email').mailto();
    });

    if (deliveries == null) var deliveries = {}; //set up deliveries object for methods relating to deliveries calendar

    $("#month-table").ready(function () {
        deliveries.init();
    });

    deliveries.init = function () {
        var shiftMode = $('input[name=shiftDeliveryMode]').val();
        if (shiftMode == true) {
            deliveries.turnShiftModeOn();
        }
    }

    deliveries.turnShiftModeOff = function () {
        $('input[name=shiftDeliveryMode]').val(0);
        $('#feature').find('#infotabs .shift span').html('Shift This Delivery');
        $('#feature').find('#infotabs .shift').removeClass("curr");
        $('#feature').find('#infotabs .shift').css("background-color", "");
        $('#feature').find('#infotabs .skip').removeClass("disabled");
        $('#feature').find('#infotabs .change').removeClass("disabled");
        $(".month-paginator").attr("shift-delivery-mode", 0);
        $(".my-services tfoot .shift-only").hide();

        $(".validDate").children().removeClass("selectable");
        $(".validDate").children().css('cursor', 'default');
        $(".validDate").children().unbind('click');

        $(".existing").each(function () {
            var span = $(this).children("span");
            $(this).children("span").remove();
            var anchor = $(this).children();
            anchor.append(span);
            anchor.show();
        });
    }

    deliveries.turnShiftModeOn = function () {
        $('input[name=shiftDeliveryMode]').val(1);
        $('#feature').find('#infotabs .shift span').html('Cancel Shift Delivery');
        if (!$('#feature').find('#infotabs .skip').hasClass("disabled"))
            $('#feature').find('#infotabs .skip').addClass("disabled");
        if (!$('#feature').find('#infotabs .change').hasClass("disabled"))
            $('#feature').find('#infotabs .change').addClass("disabled");
        $('#feature').find('#infotabs .shift').addClass("curr");
        $(".month-paginator").attr("shift-delivery-mode", 1);
        $(".my-services tfoot .shift-only").show();
        if (!$(".validDate").children().hasClass("selectable"))
            $(".validDate").children().addClass("selectable");

        $(".validDate").children().css('cursor', 'pointer');

        $(".validDate").each(function () {
            var deliveryId = $(this).children().attr("delivery-id");
            var month = $(this).children().attr("month") - 1; //Javascript month is 0-indexed
            var day = $(this).children().attr("day");
            var year = $(this).children().attr("year");
            $(this).bind('click', { month: month,
                day: day,
                year: year,
                deliveryId: deliveryId
            },
            deliveries.shiftDeliveryConfirm);
        });

        $(".existing").each(function () {
            var anchor = $(this).children();
            var span = anchor.children();
            anchor.hide();
            $(this).append(span);
        });
    }

    deliveries.shiftDeliveryConfirm = function (event) {
        event.preventDefault();
        var deliveryId = event.data.deliveryId;
        var newDate = new Date(event.data.year, event.data.month, event.data.day);
        msgUtils.showDialog('<p>Are you sure you want to shift this delivery to ' + $.datepicker.formatDate("mm/dd/yy", newDate) + '?</p><a href="#" class="btn">Yes</a><a href="#" class="close">No</a>', '');
        $('#modal .btn').click(function (e) {
            e.preventDefault();
            $.ajax({
                type: "POST",
                url: "/Account/ShiftDeliveryDay",
                data: {
                    deliveryId: deliveryId,
                    deliveryDate: $.datepicker.formatDate("mm/dd/yy", newDate)
                },
                success: function (data) {

                    if (data.success == "true") {
                        $('#selectSub').append("<input id=\"deliveryId\" value=\"" + deliveryId + "\" />");
                        msgUtils.showDialog('Your delivery date has been successfully changed! Reloading...', '');
                        $('#selectSub').submit();
                    } else {
                        msgUtils.showError(data.message);
                    }
                },
                error: function (jXhr, data, msg) {
                    msgUtils.showError(data.message);
                }
            });
        });
    }
});

var bios = (function() {
    var activeBio = null,
    activeBioGroup = null,
    div = null,
    fadeTime = 500,
    slideEase = 'easeOutQuad',
    slideTime = 650,
    working = false;

    function getElements(bioId) {
        var li = div.find('li[data-bio="' + bioId + '"]'),
        content = div.find('div.bio-content[data-bio="' + bioId + '"]');

        return {
            li: li,
            content: content
        }
    }

    function showBio(bio, bioGroup) {
        if(working || bio === activeBio)
            return;

        working = true;
        if(bioGroup === activeBioGroup)
            switchInGroup(bio);
        else
            switchGroups(bio, bioGroup);
    }

    function switchGroups(bio, bioGroup) {
        var oldBio = null,
        newBio = getElements(bio),
        oldGroup = null,
        newGroup =  div.find('.bio-group[data-bio-group="' + bioGroup + '"]');

        if(activeBio !== null) {
            oldBio = getElements(activeBio);
            oldGroup = div.find('.bio-group[data-bio-group="' + activeBioGroup + '"]')
        }

        if(oldBio)
            oldBio.li.removeClass('active');
        newBio.li.addClass('active');

        newBio.content.show();

        if(oldBio) {
            oldGroup.slideUp({
                duration: slideTime,
                easing: slideEase
            }); 
        }
        
        newGroup.slideDown({ 
            duration: slideTime,
            easing: slideEase,
            complete: function() {
                working = false;
                activeBio = bio;
                activeBioGroup = bioGroup;

                if(oldBio)
                    oldBio.content.hide();
            }
        });
    }

    function switchInGroup(bio) {
        var oldBio = getElements(activeBio),
        newBio = getElements(bio);
        
        oldBio.li.removeClass('active');
        newBio.li.addClass('active');

        oldBio.content.fadeOut(fadeTime);
        newBio.content.fadeIn(fadeTime, function() {
            working = false;
            activeBio = bio;
        });
    }

    return {
        init: function() {
            div = $('#bios');
            div.on('click', 'ul.bios li', function() {
                var data = $(this).data();
                showBio(data.bio, data.bioGroup);
            });
        }
    }
}());

(function(has, addtest, cssprop) {
    addtest('css-transition', function(g, d, el) {
        return cssprop('transition', el);
    });
})(has, has.add, has.cssprop);

var wideWidget = (function() {
    var div = null,
    width = 1000,
    moveTime = 600,
    moveEase = 'easeOutQuad',
    working = false,
    callback = null;

    function addPhoto(url, index, sign, elem) {
        var img = elem.clone(),
        position = index * width * sign;

        img.attr('src', url);
        img.css('left', position + 'px');

        if(sign > 0)
            div.append(img);    
        else
            div.prepend(img); 
    }

    function addPhotos(addlPhotos) {
        var firstPhoto = div.find('img').eq(0),
        done = false,
        head = 0,
        tail = addlPhotos.length - 1;

        while(!done) {
            addPhoto(addlPhotos[head], head + 2, 1, firstPhoto);
            if(head < tail)
                addPhoto(addlPhotos[tail], head + 2, -1, firstPhoto);
            head++;
            tail--;
            if(head > tail)
                done = true;
        }
    }

    function divLeft() {
        return parseInt(div.css('left'), 10);
    }

    function move() {
        var a = $(this),
        direction = null,
        imgs = div.find('img'),
        moveImg = null,
        moveAmount = 0,
        firstImg = $(imgs[0]),
        lastImg = $(imgs[imgs.length - 1]),
        activeImg = div.find('img.active'),
        newActive = null,
        hasTransitions = true;

        if(working)
            return;

        working = true;

        if(a.hasClass('btn-next')) {
            direction = 'left';
            moveAmount = width * -1;
            callback = function() {
                var left = lastImg.position().left + width;
                firstImg.addClass('notrans').insertAfter(lastImg).css('left', left + 'px');
                firstImg.removeClass('notrans');
            }
            newActive = $(imgs[activeImg.index() + 1]);
        } else {
            direction = 'right';
            moveAmount = width;
            callback = function() {
                var left = firstImg.position().left - width;
                lastImg.addClass('notrans').insertBefore(firstImg).css('left', left + 'px');
                lastImg.removeClass('notrans');
            }
            newActive = $(imgs[activeImg.index() - 1]);
        }

        if(has('css-transition')) {
            newActive.addClass('active');
            activeImg.removeClass('active');
            div.css('left', (divLeft() + moveAmount) + 'px');
        } else {
            newActive.animate({
                opacity: 1.0
            }, moveTime, moveEase, function() {
                $(this).addClass('active');
            });
            activeImg.animate({
                opacity: 0.5
            }, moveTime, moveEase, function() {
                $(this).removeClass('active');
            });
            div.animate({
                left: (divLeft() + moveAmount) + 'px'
            }, moveTime, moveEase, function() {
                callback();
                working = false;
            });
        }
    }

    return {
        init: function(addlPhotos) {
            div = $('.wide-photowidget .photostrip');
            div.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function(e) {
                if(e.target.nodeName.toLowerCase() === 'div') {
                    callback();
                    working = false;
                }
            });
            $('.wide-photowidget').on('click', 'a', move);
            addPhotos(addlPhotos);
            if(!has('css-opacity'))
                $('.wide-photowidget .photostrip img:not(.active)').css('opacity', 0.5);
        }
    }
}());

$.widget('hb.carousel', {

    options: {
        itemSelector: '.carousel-item',
        current: 0,
        autoplay: false,
        autoplayDelay: 5000,
        crossfade: true,
        transitionTime: 2000 //only used for jquery animation
    },
    _animateOpacity: function(element, opacity) {
        //animate the opacity and return a promise when done
        var deferred = $.Deferred();
        element = $(element);
        if(has('css-transition') && has('css-opacity')) {
            //css animation
            element.css('opacity', opacity);
            element.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function(e) {
                deferred.resolve();
            });
        } else {
            //jquery animation
            element.animate({opacity: opacity}, this.options.transitionTime, function() {
                deferred.resolve();
            });
        }

        return deferred.promise();
    },
    _autoNext: function() {
        var callback = function() {
            if(this.playing)
                this._next();
        }
        this._delay(callback, this.options.autoplayDelay);
    },
    _change: function(newIndex) {
        if(this.working)
            return;

        this.working = true;
        var currentItem = this.items[this.current];
        var nextItem = this.items[newIndex];
        $(nextItem).show();
        var promise1 = this._animateOpacity(currentItem, 0.01);
        
        //hang onto "this" for the callbacks below
        var c = this;

        //do animations in parallel or in series
        if(this.options.crossfade) {
            var promise2 = this._animateOpacity(nextItem, 0.99);
        } else {
            var deferred2 = $.Deferred();
            var promise2 = deferred2.promise();
            promise1.then(
                function() { c._animateOpacity(nextItem, 0.99) }
            ).then(deferred2.resolve());
        }

        //update the state when both animations are finished
        $.when(promise1, promise2).done(function() {
            c.current = newIndex
            c.working = false;
            c._trigger('change', null, { index: newIndex });
            if(c.playing)
                c._autoNext();
            $(currentItem).hide();
        });
    },
    _create: function() {
        this.items = this.element.find(this.options.itemSelector);
        this.current = this.options.current;
        this.playing = false;
    },
    _init: function() {
        //start animation here
        if(this.options.autoplay) {
            this.playing = true;
            this._autoNext();
        }
        //hide all except the first element
        $.each(this.items.slice(1), function(i, item) {
            $(item).hide();
        });
    },
    _next: function() {
        var newIndex = this.current + 1;
        if(newIndex > this.items.length - 1)
            newIndex = 0;
        this._change(newIndex);
    },
    _prev: function() {
        var newIndex = this.current - 1;
        if(newIndex < 0)
            newIndex = this.items.length - 1;
        this._change(newIndex);
    },
    goto: function(index) {
        this._change(index);
    },
    next: function() {
        this._next();
    },
    play: function() {
        this.playing = true;
        this._next();
    },
    prev: function() {
        this._prev();
    },
    stop: function() {
        this.playing = false;
    }
});