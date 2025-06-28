// script.js

// --- Elementos da página ---
const toolsButton = document.getElementById('tools-button');
const overtimeButton = document.getElementById('overtime-button');
const registerCheckoutButton = document.getElementById('register-checkout-button');
const salaryContainer = document.getElementById('salary-container');
const overtimeContainer = document.getElementById('overtime-container');
const backButton = document.getElementById('back-button');
const backOvertimeButton = document.getElementById('back-overtime-button');
const saveBtn = document.getElementById('save-btn');
const resultsContainer = document.getElementById('results-container');
const resultsContent = document.getElementById('results-content');
const addOvertimeBtn = document.getElementById('add-overtime-btn');
const clearOvertimeBtn = document.getElementById('clear-overtime-btn');
const exportOvertimeBtn = document.getElementById('export-overtime-btn');
const overtimeTableBody = document.getElementById('overtime-table-body');
const totalOvertimeDisplay = document.getElementById('total-overtime');
const normalEndTimeInput = document.getElementById('normal-end-time');
const isSaturdayCheckbox = document.getElementById('is-saturday');
const isFridayCheckbox = document.getElementById('is-friday');
const isHolidayOvertimeCheckbox = document.getElementById('is-holiday-overtime');
const overtimeDateInput = document.getElementById('overtime-date');

// Elementos do Modal Customizado
const customModalOverlay = document.getElementById('custom-modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalButtons = document.getElementById('modal-buttons');
const modalCloseBtn = document.querySelector('.modal-close');

// --- Funções de Navegação de Páginas ---
function showSection(section) {
    document.querySelector('.button-container').style.display = 'none';
    salaryContainer.style.display = 'none';
    overtimeContainer.style.display = 'none';
    section.style.display = 'block';
}

function goBackToMain() {
    salaryContainer.style.display = 'none';
    overtimeContainer.style.display = 'none';
    document.querySelector('.button-container').style.display = 'flex';
}

toolsButton.addEventListener('click', () => showSection(salaryContainer));
overtimeButton.addEventListener('click', () => {
    showSection(overtimeContainer);
    loadOvertimeRecords();
});
backButton.addEventListener('click', goBackToMain);
backOvertimeButton.addEventListener('click', goBackToMain);

// --- Modal de Mensagem Customizado ---
function showCustomModal(title, message, type = 'alert') {
    return new Promise((resolve) => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalButtons.innerHTML = '';
        if (type === 'alert') {
            const okBtn = document.createElement('button');
            okBtn.textContent = 'OK';
            okBtn.classList.add('btn', 'confirm-btn');
            okBtn.addEventListener('click', () => {
                customModalOverlay.style.display = 'none';
                resolve(true);
            });
            modalButtons.appendChild(okBtn);
        } else if (type === 'confirm') {
            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = 'Confirmar';
            confirmBtn.classList.add('btn', 'confirm-btn');
            confirmBtn.addEventListener('click', () => {
                customModalOverlay.style.display = 'none';
                resolve(true);
            });
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancelar';
            cancelBtn.classList.add('btn', 'cancel-btn');
            cancelBtn.addEventListener('click', () => {
                customModalOverlay.style.display = 'none';
                resolve(false);
            });
            modalButtons.appendChild(confirmBtn);
            modalButtons.appendChild(cancelBtn);
        }
        customModalOverlay.style.display = 'flex';
    });
}
modalCloseBtn.addEventListener('click', () => {
    customModalOverlay.style.display = 'none';
});
customModalOverlay.addEventListener('click', (e) => {
    if (e.target === customModalOverlay) {
        customModalOverlay.style.display = 'none';
    }
});

// --- PÁGINA DE CONFIGURAÇÃO DE SALÁRIO ---
saveBtn.addEventListener('click', async () => {
    const monthlySalary = parseFloat(document.getElementById('monthly-salary').value);
    const hourValue50 = parseFloat(document.getElementById('hour-value-50').value);
    const hourValue100 = parseFloat(document.getElementById('hour-value-100').value);
    const normalEndTime = document.getElementById('normal-end-time').value;

    if (isNaN(monthlySalary) || monthlySalary < 0) {
        await showCustomModal('Erro de Entrada', 'Por favor, informe um salário mensal válido!', 'alert');
        return;
    }
    if (isNaN(hourValue50) || hourValue50 < 0) {
        await showCustomModal('Erro de Entrada', 'Por favor, informe um valor válido para Hora Extra 50%!', 'alert');
        return;
    }
    if (isNaN(hourValue100) || hourValue100 < 0) {
        await showCustomModal('Erro de Entrada', 'Por favor, informe um valor válido para Hora Extra 100%!', 'alert');
        return;
    }
    if (!isValidTime(normalEndTime)) {
        await showCustomModal('Erro de Entrada', 'Por favor, informe uma hora de saída normal válida (HH:MM)!', 'alert');
        return;
    }
    const salaryData = { monthlySalary, hourValue50, hourValue100, normalEndTime };
    localStorage.setItem('salaryData', JSON.stringify(salaryData));
    resultsContent.innerHTML = `
        <div class="result-item"><span class="result-label">Dados salvos com sucesso!</span></div>
        <div class="result-item"><span class="result-label">Salário Mensal:</span><span class="result-value">${formatCurrency(monthlySalary)}</span></div>
        <div class="result-item"><span class="result-label">Hora Extra 50%:</span><span class="result-value">${formatCurrency(hourValue50)}</span></div>
        <div class="result-item"><span class="result-label">Hora Extra 100%:</span><span class="result-value">${formatCurrency(hourValue100)}</span></div>
        <div class="result-item"><span class="result-label">Hora de Saída Normal:</span><span class="result-value">${normalEndTime}</span></div>
    `;
    resultsContainer.style.display = 'block';
});

// --- FUNÇÃO DE CÁLCULO CENTRALIZADA ---
function calculateOvertimeDetails(dateString, start, end, isHoliday, isFriday, isSaturday) {
    const salaryData = JSON.parse(localStorage.getItem('salaryData')) || { monthlySalary: 3829.26, hourValue50: 26.10, hourValue100: 34.81, normalEndTime: "17:44" };
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let [normalEndH, normalEndM] = salaryData.normalEndTime.split(':').map(Number);
    if (isFriday) {
        normalEndH = 16;
        normalEndM = 44;
    }
    let totalMinutesWorked = (endH * 60 + endM) - (startH * 60 + startM);
    if (totalMinutesWorked < 0) {
        totalMinutesWorked += 24 * 60;
    }
    if (totalMinutesWorked / 60 > 6) {
        totalMinutesWorked -= 60;
    }
    const totalHoursDecimal = totalMinutesWorked / 60;
    let extra50 = 0;
    let extra100 = 0;
    const isSunday = new Date(dateString + 'T00:00:00').getDay() === 0;
    const isSundayOrHolidayToday = isHoliday || isSunday;
    if (isSundayOrHolidayToday) {
        extra100 = totalHoursDecimal;
    } else if (isSaturday) {
        extra50 = Math.min(totalHoursDecimal, 2);
        extra100 = Math.max(0, totalHoursDecimal - 2);
    } else {
        let extraMinutesBeyondNormal = (endH * 60 + endM) - (normalEndH * 60 + normalEndM);
        if (extraMinutesBeyondNormal < 0) {
            extraMinutesBeyondNormal = 0;
        }
        let extraHoursDecimal = extraMinutesBeyondNormal / 60;
        extra50 = Math.min(extraHoursDecimal, 2);
        extra100 = Math.max(0, extraHoursDecimal - 2);
    }
    const value50 = extra50 * salaryData.hourValue50;
    const value100 = extra100 * salaryData.hourValue100;
    const totalValue = value50 + value100;
    return { date: dateString, start, end, totalHours: totalHoursDecimal, isHoliday: isSundayOrHolidayToday, isFriday, isSaturday, dayType: isSundayOrHolidayToday ? "Domingo/Feriado" : (isSaturday ? "Sábado" : (isFriday ? "Sexta-feira" : "Dia Útil")), extra50, value50, extra100, value100, totalValue };
}

// --- PÁGINA DE CÁLCULO DE HORAS EXTRAS ---
function loadOvertimeRecords() {
    const records = (JSON.parse(localStorage.getItem('allWorkRecords')) || []).filter(r => r.type === 'extra');
    records.sort((a, b) => b.dateISO.localeCompare(a.dateISO));
    overtimeTableBody.innerHTML = '';
    records.forEach(record => {
        addOvertimeToTable(record);
    });
    calculateOvertimeTotal();
}

addOvertimeBtn.addEventListener('click', async () => {
    const dateInputVal = overtimeDateInput.value;
    const endTime = document.getElementById('overtime-end').value;
    const isFriday = isFridayCheckbox.checked;
    const isSaturday = isSaturdayCheckbox.checked;
    const isHoliday = isHolidayOvertimeCheckbox.checked;
    if (!dateInputVal || !endTime) {
        await showCustomModal('Erro de Preenchimento', 'Por favor, preencha todos os campos obrigatórios.', 'alert');
        return;
    }
    if (!isValidDate(dateInputVal)) {
        await showCustomModal('Erro de Data', 'Formato de data inválido! Por favor, use o seletor de data.', 'alert');
        return;
    }
    if (!isValidTime(endTime)) {
        await showCustomModal('Erro de Hora', 'Formato de hora inválido! Use HH:MM.', 'alert');
        return;
    }
    const dateISO = dateInputVal;
    const startTime = "08:00";
    const details = calculateOvertimeDetails(dateISO, startTime, endTime, isHoliday, isFriday, isSaturday);
    const record = { id: Date.now(), type: 'extra', date: formatDate(dateISO), dateISO, start: details.start, end: details.end, totalHours: details.totalHours, isHoliday: details.isHoliday, isFriday: details.isFriday, isSaturday: details.isSaturday, hours50: details.extra50, value50: details.value50, hours100: details.extra100, value100: details.value100, totalValue: details.totalValue };
    const allRecords = JSON.parse(localStorage.getItem('allWorkRecords')) || [];
    allRecords.push(record);
    localStorage.setItem('allWorkRecords', JSON.stringify(allRecords));
    loadOvertimeRecords();

    // Lógica de reset do formulário
    const now = new Date();
    isHolidayOvertimeCheckbox.checked = false; // Limpa a seleção de feriado
    overtimeDateInput.value = now.toISOString().split('T')[0];
    document.getElementById('overtime-end').value = now.toTimeString().slice(0, 5);
    overtimeDateInput.dispatchEvent(new Event('change'));
});

function addOvertimeToTable(record) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${record.date}</td><td>${record.start}</td><td>${record.end}</td><td>${formatDecimalHours(record.totalHours)}</td>
        <td class="hidden-column">${record.isHoliday ? 'X' : ''}</td><td class="hidden-column">${record.isFriday ? 'X' : ''}</td><td class="hidden-column">${record.isSaturday ? 'X' : ''}</td>
        <td>${formatDecimalHours(record.hours50)}</td><td>${formatCurrency(record.value50)}</td><td>${formatDecimalHours(record.hours100)}</td><td>${formatCurrency(record.value100)}</td>
        <td>${formatCurrency(record.totalValue)}</td>
        <td><button class="delete-btn" data-id="${record.id}" data-record-type="extra"><i class="fas fa-trash"></i></button></td>
    `;
    overtimeTableBody.appendChild(row);
}

function calculateOvertimeTotal() {
    const records = (JSON.parse(localStorage.getItem('allWorkRecords')) || []).filter(r => r.type === 'extra');
    let total = 0;
    records.forEach(record => {
        total += record.totalValue;
    });
    totalOvertimeDisplay.textContent = `Total Geral: ${formatCurrency(total)}`;
}

clearOvertimeBtn.addEventListener('click', () => {
    const now = new Date();
    isHolidayOvertimeCheckbox.checked = false;
    overtimeDateInput.value = now.toISOString().split('T')[0];
    document.getElementById('overtime-end').value = now.toTimeString().slice(0, 5);
    overtimeDateInput.dispatchEvent(new Event('change'));
});

exportOvertimeBtn.addEventListener('click', async () => {
    const records = (JSON.parse(localStorage.getItem('allWorkRecords')) || []).filter(r => r.type === 'extra');
    if (records.length === 0) {
        await showCustomModal('Atenção', 'Não há registros de horas extras para exportar!', 'alert');
        return;
    }
    let csvContent = "Data,Entrada,Saída,Horas Totais,Domingo/Feriado,Sexta,Sábado,H Extra 50%,Valor 50% R$,Extra 100%,Valor 100% R$,Cálculo Total\n";
    records.forEach(record => {
        const dateToExport = record.dateISO || record.date;
        csvContent += `${dateToExport},${record.start},${record.end},${formatDecimalHours(record.totalHours)},`;
        csvContent += `${record.isHoliday ? 'Sim' : 'Não'},${record.isFriday ? 'Sim' : 'Não'},${record.isSaturday ? 'Sim' : 'Não'},`;
        csvContent += `${formatDecimalHours(record.hours50)},${record.value50.toFixed(2).replace('.', ',')},`;
        csvContent += `${formatDecimalHours(record.hours100)},${record.value100.toFixed(2).replace('.', ',')},`;
        csvContent += `${record.totalValue.toFixed(2).replace('.', ',')}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'horas_extras.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

// --- Lógica de Deleção Unificada ---
document.addEventListener('click', async (e) => {
    const deleteButton = e.target.closest('.delete-btn');
    if (deleteButton) {
        e.stopPropagation();
        const idToDelete = parseInt(deleteButton.dataset.id);
        const type = deleteButton.dataset.recordType;
        const confirmDelete = await showCustomModal('Confirmar Exclusão', 'Tem certeza que deseja excluir este registro?', 'confirm');
        if (confirmDelete) {
            let allRecords = JSON.parse(localStorage.getItem('allWorkRecords')) || [];
            const indexToDelete = allRecords.findIndex(r => r.id === idToDelete);
            if (indexToDelete > -1) {
                allRecords.splice(indexToDelete, 1);
                localStorage.setItem('allWorkRecords', JSON.stringify(allRecords));
                if (type === 'extra') {
                    loadOvertimeRecords();
                }
            } else {
                await showCustomModal('Erro', 'Registro não encontrado para exclusão.', 'alert');
            }
        }
    }
});

// --- Lógica para o botão "Registrar Saída" ---
async function registerCheckout() {
    const confirmCheckout = await showCustomModal('Registrar Saída', 'Deseja registrar sua saída com a hora atual?', 'confirm');
    if (!confirmCheckout) return;
    const now = new Date();
    const dateISO = now.toISOString().split('T')[0];
    const endTime = now.toTimeString().slice(0, 5);
    const dayOfWeek = now.getDay();
    const isFriday = dayOfWeek === 5;
    const isSaturday = dayOfWeek === 6;
    const isHoliday = dayOfWeek === 0;
    const startTime = "08:00";
    const details = calculateOvertimeDetails(dateISO, startTime, endTime, isHoliday, isFriday, isSaturday);
    const record = { id: Date.now(), type: 'extra', date: formatDate(dateISO), dateISO: dateISO, start: details.start, end: details.end, totalHours: details.totalHours, isHoliday: details.isHoliday, isFriday: details.isFriday, isSaturday: details.isSaturday, hours50: details.extra50, value50: details.value50, hours100: details.extra100, value100: details.value100, totalValue: details.totalValue };
    const allRecords = JSON.parse(localStorage.getItem('allWorkRecords')) || [];
    allRecords.push(record);
    localStorage.setItem('allWorkRecords', JSON.stringify(allRecords));
    await showCustomModal('Sucesso!', `Sua saída foi registrada às ${endTime}.`, 'alert');
}
registerCheckoutButton.addEventListener('click', registerCheckout);

// --- FUNÇÕES AUXILIARES ---
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

function formatDecimalHours(decimalHours) {
    if (isNaN(decimalHours) || decimalHours < 0) return "0:00";
    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

function formatCurrency(value) {
    if (isNaN(value)) return "R$ 0,00";
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function isValidDate(dateString) {
    const regexISO = /^\d{4}-\d{2}-\d{2}$/;
    if (regexISO.test(dateString)) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toISOString().slice(0, 10) === dateString;
    }
    const regexBR = /^\d{2}\/\d{2}\/\d{4}$/;
    if (regexBR.test(dateString)) {
        const parts = dateString.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
    }
    return false;
}

function isValidTime(timeString) {
    const regex = /^\d{2}:\d{2}$/;
    if (!regex.test(timeString)) return false;
    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
}

// ALTERADO: A função agora apenas marca a caixa, sem desabilitar (travar).
function checkDayOfWeek() {
    const dateString = overtimeDateInput.value;
    if (!isValidDate(dateString)) {
        // Se a data for inválida ou limpa, desmarca ambos
        isFridayCheckbox.checked = false;
        isSaturdayCheckbox.checked = false;
        return;
    }
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDay(); // Domingo = 0, Sexta = 5, Sábado = 6

    // Apenas marca ou desmarca a caixa, sem usar a propriedade 'disabled'
    isFridayCheckbox.checked = (day === 5);
    isSaturdayCheckbox.checked = (day === 6);
}

// --- Inicialização ao Carregar a Página ---
document.addEventListener('DOMContentLoaded', () => {
    const savedSalary = localStorage.getItem('salaryData');
    if (savedSalary) {
        const salaryData = JSON.parse(savedSalary);
        document.getElementById('monthly-salary').value = salaryData.monthlySalary?.toFixed(2) || '3829.26';
        document.getElementById('hour-value-50').value = salaryData.hourValue50?.toFixed(2) || '26.10';
        document.getElementById('hour-value-100').value = salaryData.hourValue100?.toFixed(2) || '34.81';
        document.getElementById('normal-end-time').value = salaryData.normalEndTime || '17:44';
    }
    const now = new Date();
    overtimeDateInput.value = now.toISOString().split('T')[0];
    document.getElementById('overtime-end').value = now.toTimeString().slice(0, 5);
    overtimeDateInput.addEventListener('change', checkDayOfWeek);
    checkDayOfWeek();
});
