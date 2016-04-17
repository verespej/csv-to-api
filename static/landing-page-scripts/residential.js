(function () {
    $(function () {
        initCarousel();
        var modal = $('#details-modal'),
		modalConsultation = $('#modal-consultation'),
		modalConsultationSubmission = $('#modal-consultation-submission');

        function showModal() {
            modal.addClass('active');
        }

        /* close (hide) modal window */
        function closeModal() {
            // prevent blocked modal from closing
            if (modal.hasClass('blocked'))
                return;

            // hide the window
            modal.removeClass('active');

            // clean up by removing any temporary items from the modal and removing submitting classes/status
            modal.find('.temporary').remove();
            modal.find('.submitting').removeClass('submitting');
        };

        function initCarousel() {
            var container = $('#shop-carousel');
            container.carousel({
                itemSelector: 'li',
                autoplay: true,
                autoplayDelay: 6000,
                crossfade: false,
                transitionTime: 500
            });
            container.find('.btn-next').on('click', function () {
                container.carousel('stop');
                container.carousel('next');
            });
            container.find('.btn-prev').on('click', function () {
                container.carousel('stop');
                container.carousel('prev');
            });
        };

        // bind event handlers
        $(window).keyup(function (e) {
            if (e.which == 27) closeModal(); // close modal when escape key is pressed
        });
        modal.click(function (e) {
            if (!$(e.target).closest('.shadow').length) closeModal(); // close modal if not clicking on actual content within modal
        });


        $('.close-modal').click(closeModal);
        $('.corporate-lead-form').submit(function (e) {
            var form = $(this),
			formValid = true;

            e.preventDefault();

            form.find('input[required], select[required]').each(function () {
                var field = $(this);
                if (!field.val()) {
                    field.addClass('error');
                    formValid = false;
                } else {
                    field.removeClass('error');
                }
            });

            if (!formValid)
                return;

            var gaqEventName;
            var gaqEventValue;
            var postUrl;

            var lead = form.attr("data-lead");
            if(lead === "Residential") {
                gaqEventName = "Residential";
                gaqEventValue = "Residential Consultation Request";
                postUrl = "/corporateleadgen/PerformResidentialGeneration";
            } else if(lead === "CorporateGift") {
                gaqEventName = "CorporateGift";
                gaqEventValue = "Corporate Gifting Consultation Request";
                postUrl = "/corporateleadgen/PerformCorporateGiftGeneration";
            } else if(lead === 'Business') {
                gaqEventName = 'Business';
                gaqEventValue = 'Consultation Request';
                postUrl = '/corporateleadgen/performgeneration';
            }

            // fire event to track conversion
            _gaq.push(['_trackEvent', gaqEventName, gaqEventValue]);

            // submit form asynchronously

            $.ajax({
                url: postUrl,
                type: 'POST',
                data: form.serialize(),
                beforeSend: function () {
                    // show modal and show pending message
                    showModal();
                    modal.addClass('blocked');
                    modalConsultation.addClass('submitting');
                    modalConsultationSubmission.addClass('submitting')
		          .children('.status').removeClass('active')
		          .filter('.pending').addClass('active');
                },
                success: function () {
                    modalConsultationSubmission.children('.status').removeClass('active')
		          .filter('.success').addClass('active');
                },
                error: function () {
                    modalConsultationSubmission.children('.status').removeClass('active')
		          .filter('.failure').addClass('active');
                },
                complete: function () {
                    modal.removeClass('blocked');
                }
            });
        });
    });
})();