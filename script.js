(function () {
    const form = document.getElementById('multiStepForm');
    const panels = Array.from(form.querySelectorAll('.panel'));
    const steps = Array.from(document.querySelectorAll('.steps__item'));

    let currentStep = 1;
    let yearly = false;

    function showStep(step) {
        currentStep = step;
        panels.forEach(p => {
            const isTarget = Number(p.getAttribute('data-step')) === step;
            p.toggleAttribute('hidden', !isTarget);
        });
        steps.forEach(s => {
            const index = Number(s.getAttribute('data-step'));
            s.classList.toggle('is-active', index === step);
        });
    }

    function setBillingUI() {
        const switchBtn = form.querySelector('.js-billing');
        switchBtn.setAttribute('aria-pressed', String(yearly));
        document.body.classList.toggle('is-yearly', yearly);
        // Update prices
        form.querySelectorAll('.plan__price').forEach(el => {
            el.textContent = el.getAttribute(yearly ? 'data-price-yearly' : 'data-price-monthly');
        });
        form.querySelectorAll('.addon__price').forEach(el => {
            el.textContent = el.getAttribute(yearly ? 'data-price-yearly' : 'data-price-monthly');
        });
    }

    function validateStep1() {
        const name = form.name;
        const email = form.email;
        const phone = form.phone;
        let valid = true;

        const setError = (input, message) => {
            const errorEl = form.querySelector(`[data-error-for="${input.name}"]`);
            input.classList.toggle('error', Boolean(message));
            errorEl.textContent = message || '';
            if (message) valid = false;
        };

        setError(name, name.value.trim() ? '' : 'This field is required');
        const emailVal = email.value.trim();
        const emailValid = /.+@.+\..+/.test(emailVal);
        setError(email, emailVal ? (emailValid ? '' : 'Enter a valid email') : 'This field is required');
        setError(phone, phone.value.trim() ? '' : 'This field is required');
        return valid;
    }

    function validateStep2() {
        const chosen = form.querySelector('input[name="plan"]:checked');
        return Boolean(chosen);
    }

    function buildSummary() {
        const planInput = form.querySelector('input[name="plan"]:checked');
        const planCard = planInput ? planInput.closest('.plan') : null;
        const planName = planCard ? planCard.querySelector('.plan__name').textContent : '';
        const planPrice = planCard ? planCard.querySelector('.plan__price').textContent : '';

        const titleEl = form.querySelector('.summary__title');
        const priceEl = form.querySelector('.summary__price');
        titleEl.textContent = `${planName} (${yearly ? 'Yearly' : 'Monthly'})`;
        priceEl.textContent = planPrice;

        const addonsWrap = form.querySelector('.summary__addons');
        addonsWrap.innerHTML = '';
        const selectedAddons = Array.from(form.querySelectorAll('.addon__control:checked'));
        selectedAddons.forEach(input => {
            const card = input.closest('.addon');
            const name = card.querySelector('.addon__name').textContent;
            const price = card.querySelector('.addon__price').textContent;
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.innerHTML = `<span>${name}</span><span>${price}</span>`;
            addonsWrap.appendChild(row);
        });

        const totalEl = form.querySelector('.summary__total-value');
        const totalLabel = form.querySelector('.summary__total-label');
        const planAmount = parseInt(planPrice.replace(/[^0-9]/g, ''), 10) || 0;
        const addonsAmount = selectedAddons.reduce((sum, input) => {
            const priceText = input.closest('.addon').querySelector('.addon__price').textContent;
            const amount = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;
            return sum + amount;
        }, 0);
        const isYear = yearly;
        const total = planAmount + addonsAmount;
        totalEl.textContent = `+$${total}/${isYear ? 'yr' : 'mo'}`;
        totalLabel.textContent = `Total (per ${isYear ? 'year' : 'month'})`;
    }

    function next() {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 2 && !validateStep2()) return;
        const target = Math.min(4, currentStep + 1);
        showStep(target);
        if (target === 4) buildSummary();
    }

    function back() {
        const target = Math.max(1, currentStep - 1);
        showStep(target);
    }

    function confirm() {
        showStep(5);
    }

    function init() {
        // Step navigation
        form.addEventListener('click', (e) => {
            const nextBtn = e.target.closest('.js-next');
            const backBtn = e.target.closest('.js-back');
            const billingBtn = e.target.closest('.js-billing');
            const confirmBtn = e.target.closest('.js-confirm');
            const changePlan = e.target.closest('.js-change-plan');
            if (nextBtn) next();
            if (backBtn) back();
            if (billingBtn) { yearly = !yearly; setBillingUI(); }
            if (confirmBtn) confirm();
            if (changePlan) showStep(2);
        });

        // Keyboard support for Enter to go next, except when on last steps
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const tag = (e.target.tagName || '').toLowerCase();
                if (tag === 'input') {
                    e.preventDefault();
                    next();
                }
            }
        });

        setBillingUI();
        showStep(1);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


