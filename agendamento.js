document.addEventListener('DOMContentLoaded', function () {
    // Calendar Logic
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthSpan = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const selectedDateInput = document.getElementById('selected-date');

    let currentDate = new Date();
    let selectedDate = null;

    function renderCalendar(date) {
        calendarGrid.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();

        // Update Header
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        currentMonthSpan.textContent = `${monthNames[month]} ${year}`;

        // Day Headers
        const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('calendar-day-header');
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // First day of the month
        const firstDay = new Date(year, month, 1).getDay();
        // Days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            const emptySlot = document.createElement('div');
            calendarGrid.appendChild(emptySlot);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = i;

            const currentDayDate = new Date(year, month, i);
            const dayOfWeek = currentDayDate.getDay();

            // Disable Sundays (0) and Mondays (1)
            if (dayOfWeek === 0 || dayOfWeek === 1) {
                dayElement.classList.add('disabled');
            } else {
                dayElement.addEventListener('click', () => selectDate(currentDayDate, dayElement));
            }

            // Highlight today
            const today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayElement.classList.add('today');
            }

            // Highlight selected
            if (selectedDate &&
                i === selectedDate.getDate() &&
                month === selectedDate.getMonth() &&
                year === selectedDate.getFullYear()) {
                dayElement.classList.add('selected');
            }

            calendarGrid.appendChild(dayElement);
        }
    }

    function selectDate(date, element) {
        selectedDate = date;
        selectedDateInput.value = formatDate(date);

        // Update UI
        document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
    }

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    renderCalendar(currentDate);


    // Time Picker Logic
    const timePickerList = document.getElementById('time-picker-list');
    const selectedTimeInput = document.getElementById('selected-time');
    const timeSlots = [];

    // Generate time slots (08:00 to 20:00, every 50 mins)
    const startHour = 8;
    const endHour = 20;
    const intervalMinutes = 50;

    let currentMinutes = startHour * 60;
    const endMinutes = endHour * 60;

    while (currentMinutes <= endMinutes) {
        const h = Math.floor(currentMinutes / 60);
        const m = currentMinutes % 60;
        const timeString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        timeSlots.push(timeString);
        currentMinutes += intervalMinutes;
    }

    timeSlots.forEach(time => {
        const li = document.createElement('li');
        li.classList.add('time-picker-item');
        li.textContent = time;
        li.dataset.time = time;
        li.addEventListener('click', () => {
            li.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        timePickerList.appendChild(li);
    });

    // Handle Scroll to select
    let scrollTimeout;
    timePickerList.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateSelectedTime();
        }, 50); // Debounce
    });

    function updateSelectedTime() {
        const listRect = timePickerList.getBoundingClientRect();
        const center = listRect.top + listRect.height / 2;

        let closestItem = null;
        let minDistance = Infinity;

        document.querySelectorAll('.time-picker-item').forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.top + itemRect.height / 2;
            const distance = Math.abs(center - itemCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        });

        if (closestItem) {
            document.querySelectorAll('.time-picker-item').forEach(i => i.classList.remove('active'));
            closestItem.classList.add('active');
            selectedTimeInput.value = closestItem.dataset.time;
        }
    }

    // Initialize selection
    // Wait for layout
    setTimeout(() => {
        updateSelectedTime();
    }, 100);


    // Generic Custom Dropdown Logic
    const customSelects = document.querySelectorAll('.custom-select');

    customSelects.forEach(select => {
        const trigger = select.querySelector('.select-trigger');
        const triggerText = select.querySelector('.select-trigger span'); // Select the span inside
        const options = select.querySelectorAll('.option');
        const hiddenInputId = select.id.replace('custom-', '').replace('-select', ''); // e.g., custom-service-select -> service
        const hiddenInput = document.getElementById(hiddenInputId);

        // Toggle Dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate closing
            // Close others
            customSelects.forEach(other => {
                if (other !== select) other.classList.remove('open');
            });
            select.classList.toggle('open');
        });

        // Option Selection
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                // Remove selected class from siblings
                options.forEach(opt => opt.classList.remove('selected'));
                // Add to clicked
                option.classList.add('selected');

                // Update Trigger Text and Hidden Input
                const value = option.dataset.value;
                const text = option.textContent;

                triggerText.textContent = text;
                hiddenInput.value = value;

                // Specific Logic for Service "Outros"
                if (hiddenInputId === 'service') {
                    const otherServiceContainer = document.getElementById('other-service-container');
                    const otherServiceInput = document.getElementById('other-service');

                    if (value === 'Outros') {
                        otherServiceContainer.classList.remove('hidden');
                        otherServiceInput.setAttribute('required', 'required');
                    } else {
                        otherServiceContainer.classList.add('hidden');
                        otherServiceInput.removeAttribute('required');
                        otherServiceInput.value = '';
                    }
                }

                // Close Dropdown
                select.classList.remove('open');
            });
        });
    });

    // Close when clicking outside
    document.addEventListener('click', () => {
        customSelects.forEach(select => select.classList.remove('open'));
    });


    // Custom Alert Logic
    const customAlertOverlay = document.getElementById('custom-alert');
    const customAlertMessage = document.getElementById('custom-alert-message');
    const customAlertOkBtn = document.getElementById('custom-alert-ok');

    function showCustomAlert(message) {
        customAlertMessage.textContent = message;
        customAlertOverlay.classList.remove('hidden');
        // Small delay to allow display:block to apply before adding show class for transition
        setTimeout(() => {
            customAlertOverlay.classList.add('show');
        }, 10);
    }

    function hideCustomAlert() {
        customAlertOverlay.classList.remove('show');
        setTimeout(() => {
            customAlertOverlay.classList.add('hidden');
        }, 300); // Wait for transition
    }

    customAlertOkBtn.addEventListener('click', hideCustomAlert);

    // Close on click outside box
    customAlertOverlay.addEventListener('click', (e) => {
        if (e.target === customAlertOverlay) {
            hideCustomAlert();
        }
    });


    // Form Submission
    const form = document.getElementById('scheduling-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Get values
        let service = document.getElementById('service').value;
        const barber = document.getElementById('barber').value;
        const location = document.getElementById('location').value;
        const date = document.getElementById('selected-date').value;
        const time = document.getElementById('selected-time').value;
        const observations = document.getElementById('observations').value;

        if (!service) {
            showCustomAlert('Por favor, selecione um serviço.');
            return;
        }
        if (!barber) {
            showCustomAlert('Por favor, selecione um barbeiro.');
            return;
        }
        if (!location) {
            showCustomAlert('Por favor, selecione uma unidade.');
            return;
        }

        // Handle "Outros" service
        if (service === 'Outros') {
            const customService = document.getElementById('other-service').value;
            if (customService.trim() !== '') {
                service = customService; // Use custom name
            } else {
                showCustomAlert('Por favor, especifique o serviço desejado.');
                return;
            }
        }

        if (!date) {
            showCustomAlert('Por favor, selecione uma data.');
            return;
        }
        if (!time) {
            showCustomAlert('Por favor, selecione um horário.');
            return;
        }

        // Phone number (Main number from the site)
        const phoneNumber = '553171944816';

        // Construct message
        let message = `Olá, gostaria de agendar:\n\n`;
        message += `*Serviço:* ${service}\n`;
        message += `*Barbeiro:* ${barber}\n`;
        message += `*Local:* ${location}\n`;
        message += `*Data:* ${date}\n`;
        message += `*Horário:* ${time}\n`;

        if (observations) {
            message += `*Observações:* ${observations}`;
        }

        // Encode message
        const encodedMessage = encodeURIComponent(message);

        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
    });
    // URL Parameter Parsing
    const params = new URLSearchParams(window.location.search);
    const barberParam = params.get('barbeiro');
    const locationParam = params.get('barbearia');
    const serviceParam = params.get('servico');

    if (barberParam) {
        const barberOption = document.querySelector(`#custom-barber-select .option[data-value="${barberParam}"]`);
        if (barberOption) {
            barberOption.click();
        }
    }

    if (locationParam) {
        const locationOption = document.querySelector(`#custom-location-select .option[data-value="${locationParam}"]`);
        if (locationOption) {
            locationOption.click();
        }
    }

    if (serviceParam) {
        const serviceOption = document.querySelector(`#custom-service-select .option[data-value="${serviceParam}"]`);
        if (serviceOption) {
            serviceOption.click();
        }
    }
});
