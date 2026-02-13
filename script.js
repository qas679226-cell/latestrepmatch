// script.js

let roiChart;

function openModal() {
    const m = document.getElementById('app-modal');
    m.classList.remove('hidden');
    m.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const m = document.getElementById('app-modal');
    m.classList.add('hidden');
    m.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

function openQuiz() {
    openModal();
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('booking-container').classList.add('hidden');
    document.getElementById('loading-state').classList.add('hidden');
    nextStep(1);
}

function openBooking() {
    openModal();
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('booking-container').classList.remove('hidden');
    document.getElementById('loading-state').classList.add('hidden');
}

function nextStep(step) {
    const steps = document.querySelectorAll('.quiz-step');
    const targetStep = document.getElementById('step-' + step);
    if (targetStep) {
        steps.forEach(s => s.classList.remove('active'));
        targetStep.classList.add('active');
    }
}

function toggleFaq(btn) {
    const item = btn.parentElement;
    const isActive = item.classList.contains('active');

    // Close all others
    document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
    });

    // Toggle current
    if (!isActive) {
        item.classList.add('active');
    }
}

document.getElementById('audit-form').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('loading-state').classList.remove('hidden');

    fetch(this.action, {
        method: this.method,
        body: new FormData(this),
        headers: { 'Accept': 'application/json' }
    }).finally(() => {
        setTimeout(() => {
            document.getElementById('loading-state').classList.add('hidden');
            document.getElementById('booking-container').classList.remove('hidden');
        }, 1000);
    });
});

function updateROI() {
    const leads = parseInt(document.getElementById('input-leads').value);
    const acv = parseInt(document.getElementById('input-acv').value);
    const rate = parseInt(document.getElementById('input-rate').value);

    document.getElementById('val-leads').innerText = leads;
    document.getElementById('val-acv').innerText = '$' + acv.toLocaleString();
    document.getElementById('val-rate').innerText = rate + '%';

    const currRevenue = leads * (rate / 100) * acv;
    // Repmatch logic: improve conversion by at least 1.6x or floor it at 22% for SaaS
    const optimizedRate = Math.min(Math.max(rate + 10, rate * 1.6, 22), 50);
    const projectedRevenue = leads * (optimizedRate / 100) * acv;

    document.getElementById('projected-revenue').innerText = '$' + Math.round(projectedRevenue).toLocaleString();
    document.getElementById('revenue-lift').innerText = Math.round(projectedRevenue - currRevenue).toLocaleString();

    if (roiChart) {
        roiChart.data.datasets[0].data = [currRevenue, projectedRevenue];
        roiChart.update();
    }
}

window.onload = function() {
    const ctx = document.getElementById('roiChart').getContext('2d');
    roiChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Current', 'With Repmatch'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#E5E7EB', '#D97706'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (v) => '$' + (v >= 1000 ? v/1000 + 'k' : v)
                    }
                },
                x: { grid: { display: false } }
            }
        }
    });
    updateROI();
    ['input-leads', 'input-acv', 'input-rate'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateROI);
    });
};