const maxCents = 10_000_000;
const methods = [
    { label: 'Pix', rate: 0 },
    { label: 'Débito', rate: 99 },
    { label: 'Crédito à vista', rate: 249 },
];

export function parseAmount(input) {
    const match = /^(\d{1,6})(?:[,.](\d{1,2}))?$/.exec(input.trim());
    if (!match) return null;
    const cents = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
    return cents >= 1 && cents <= maxCents ? cents : null;
}

export function compareFees(cents) {
    if (!Number.isInteger(cents) || cents < 1 || cents > maxCents) return [];
    return methods.map(({ label, rate }) => {
        const fee = Math.floor((cents * rate + 5_000) / 10_000);
        return { label, rate, fee, net: cents - fee };
    });
}

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const percentage = new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
});
const formatCents = cents => money.format(cents / 100);

function bindFees(document) {
    const form = document.getElementById('fee-form');
    const input = document.getElementById('fee-amount');
    const error = document.getElementById('fee-error');
    const status = document.getElementById('fee-status');
    const results = document.getElementById('fee-results');
    const body = document.getElementById('fee-rows');

    function clearResults() {
        error.textContent = '';
        status.textContent = '';
        input.removeAttribute('aria-invalid');
        input.setAttribute('aria-describedby', 'fee-help');
        results.hidden = true;
        body.replaceChildren();
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        clearResults();
        const amount = parseAmount(input.value);
        if (amount === null) {
            error.textContent = 'Digite um valor válido, como 100,00.';
            input.setAttribute('aria-invalid', 'true');
            input.setAttribute('aria-describedby', 'fee-help fee-error');
            input.focus();
            return;
        }

        for (const { label, rate, fee, net } of compareFees(amount)) {
            const row = document.createElement('tr');
            row.className = 'border-b border-white/10';
            const heading = document.createElement('th');
            heading.scope = 'row';
            heading.className = 'p-2 font-medium text-white';
            heading.textContent = label;
            const deduction = document.createElement('td');
            deduction.className = 'p-2 text-textMuted';
            deduction.textContent = `${formatCents(fee)} (${percentage.format(rate / 10_000)})`;
            const payout = document.createElement('td');
            payout.className = 'p-2 font-semibold text-white';
            payout.textContent = formatCents(net);
            row.append(heading, deduction, payout);
            body.append(row);
        }
        results.hidden = false;
        status.textContent = `Comparação calculada para uma venda de ${formatCents(amount)}.`;
    });
    input.addEventListener('input', clearResults);
    form.hidden = false;
}

if (typeof document !== 'undefined') bindFees(document);
