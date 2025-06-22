// script.js

// --- Elementos da página ---
const toolsButton = document.getElementById('tools-button');
const overtimeButton = document.getElementById('overtime-button');
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

// Novos elementos adicionados
const normalEndTimeInput = document.getElementById('normal-end-time');
const isSaturdayCheckbox = document.getElementById('is-saturday'); // Nova checkbox para Sábado
const isFridayCheckbox = document.getElementById('is-friday'); // Referência para a checkbox de Sexta-feira
const isHolidayOvertimeCheckbox = document.getElementById('is-holiday-overtime'); // Referência para a checkbox de Domingo/Feriado
const overtimeDateInput = document.getElementById('overtime-date'); // Nova referência para o input de data

// Elementos do Modal Customizado
const customModalOverlay = document.getElementById('custom-modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalButtons = document.getElementById('modal-buttons');
const modalCloseBtn = document.querySelector('.modal-close');

// --- Funções de Navegação de Páginas ---

/**
 * Exibe a seção especificada e oculta as outras.
 * @param {HTMLElement} section - O elemento da seção a ser exibida.
 */
function showSection(section) {
    document.querySelector('.button-container').style.display = 'none';
    salaryContainer.style.display = 'none';
    overtimeContainer.style.display = 'none';
    section.style.display = 'block';
}

/**
 * Retorna à tela principal com os botões de navegação.
 */
function goBackToMain() {
    salaryContainer.style.display = 'none';
    overtimeContainer.style.display = 'none';
    document.querySelector('.button-container').style.display = 'flex';
}

// Listeners de navegação
toolsButton.addEventListener('click', () => showSection(salaryContainer));
overtimeButton.addEventListener('click', () => {
    showSection(overtimeContainer);
    loadOvertimeRecords(); // Carrega os registros de horas extras ao entrar na página
});

backButton.addEventListener('click', goBackToMain);
backOvertimeButton.addEventListener('click', goBackToMain);

// --- Modal de Mensagem Customizado ---

/**
 * Exibe um modal customizado com uma mensagem e botões.
 * @param {string} title - O título do modal.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - Tipo de modal ('alert' para um botão OK, 'confirm' para OK e Cancelar).
 * @returns {Promise<boolean>} Uma promessa que resolve para true se confirmado, false se cancelado (apenas para 'confirm').
 */
function showCustomModal(title, message, type = 'alert') {
    return new Promise((resolve) => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalButtons.innerHTML = ''; // Limpa botões anteriores

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

        customModalOverlay.style.display = 'flex'; // Exibe o modal como flex para centralizá-lo
    });
}

// Fecha o modal ao clicar no 'X'
modalCloseBtn.addEventListener('click', () => {
    customModalOverlay.style.display = 'none';
});

// Fecha o modal ao clicar fora do conteúdo
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
    const normalEndTime = document.getElementById('normal-end-time').value; // Novo campo

    // Validação dos campos
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
    if (!isValidTime(normalEndTime)) { // Valida o novo campo
        await showCustomModal('Erro de Entrada', 'Por favor, informe uma hora de saída normal válida (HH:MM)!', 'alert');
        return;
    }

    // Salva os dados no localStorage
    const salaryData = {
        monthlySalary,
        hourValue50,
        hourValue100,
        normalEndTime // Salva a hora de saída normal
    };
    localStorage.setItem('salaryData', JSON.stringify(salaryData));

    // Exibe a confirmação
    resultsContent.innerHTML = `
        <div class="result-item">
            <span class="result-label">Dados salvos com sucesso!</span>
        </div>
        <div class="result-item">
            <span class="result-label">Salário Mensal:</span>
            <span class="result-value">${formatCurrency(monthlySalary)}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Hora Extra 50%:</span>
            <span class="result-value">${formatCurrency(hourValue50)}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Hora Extra 100%:</span>
            <span class="result-value">${formatCurrency(hourValue100)}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Hora de Saída Normal:</span>
            <span class="result-value">${normalEndTime}</span>
        </div>
    `;
    resultsContainer.style.display = 'block';
});

// --- FUNÇÃO DE CÁLCULO CENTRALIZADA ---
/**
 * Calcula os detalhes das horas extras com base nos parâmetros fornecidos.
 * Esta função é a fonte única de verdade para todos os cálculos de horas no aplicativo.
 * @param {string} dateString - Data no formato YYYY-MM-DD.
 * @param {string} start - Hora de início no formato HH:MM.
 * @param {string} end - Hora final no formato HH:MM.
 * @param {boolean} isHoliday - Indica se é feriado/domingo.
 * @param {boolean} isFriday - Indica se é sexta-feira.
 * @param {boolean} isSaturday - Indica se é sábado.
 * @returns {object} Objeto contendo os detalhes das horas extras e valores calculados.
 */
function calculateOvertimeDetails(dateString, start, end, isHoliday, isFriday, isSaturday) {
    // Recupera valores de salário e horas extras configurados, ou usa valores padrão
    const salaryData = JSON.parse(localStorage.getItem('salaryData')) || {
        monthlySalary: 3829.26,
        hourValue50: 26.10,
        hourValue100: 34.81,
        normalEndTime: "17:44" // Valor padrão para hora de saída normal
    };

    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    // Hora de saída normal configurada pelo usuário
    let [normalEndH, normalEndM] = salaryData.normalEndTime.split(':').map(Number); 

    // Ajuste da hora de saída normal para Sexta-feira
    if (isFriday) {
        normalEndH = 16;
        normalEndM = 44;
    }

    // Calcula os minutos totais trabalhados
    let totalMinutesWorked = (endH * 60 + endM) - (startH * 60 + startM);

    // Ajusta para jornadas que passam da meia-noite (ex: 23:00 - 02:00 do dia seguinte)
    if (totalMinutesWorked < 0) {
        totalMinutesWorked += 24 * 60; // Adiciona um dia em minutos
    }

    // Deduz 1 hora de almoço se a jornada bruta for maior que 6 horas
    // Confirme se esta regra se aplica a todos os dias (útil, sexta, sábado, domingo/feriado)
    // Atualmente, ela se aplica a todas as jornadas > 6h.
    if (totalMinutesWorked / 60 > 6) {
        totalMinutesWorked -= 60;
    }

    const totalHoursDecimal = totalMinutesWorked / 60;

    let extra50 = 0;
    let extra100 = 0;

    // Verifica se é domingo ou feriado (todas as horas são 100%)
    const isSundayOrHolidayToday = isHoliday || (new Date(dateString + 'T00:00:00').getDay() === 0);

    if (isSundayOrHolidayToday) {
        // Se for domingo/feriado, todas as horas trabalhadas são 100% extras
        extra100 = totalHoursDecimal;
    } else if (isSaturday) {
        // Se for sábado, as primeiras 2h são 50%, o restante é 100%
        // O cálculo é feito a partir das horas TOTAIS TRABALHADAS (já descontado o almoço, se aplicável)
        extra50 = Math.min(totalHoursDecimal, 2);
        extra100 = Math.max(0, totalHoursDecimal - 2);
    } else { // Dias úteis (incluindo sexta-feira com horário de saída normal ajustado)
        // Calcula os minutos extras em relação à hora de saída normal configurada ou ajustada para sexta
        let extraMinutesBeyondNormal = (endH * 60 + endM) - (normalEndH * 60 + normalEndM);
        
        // Se a hora final for anterior à hora normal de saída, não há hora extra.
        if (extraMinutesBeyondNormal < 0) {
            extraMinutesBeyondNormal = 0;
        }

        let extraHoursDecimal = extraMinutesBeyondNormal / 60;

        // Distribuição das horas extras: primeiras 2h a 50%, o restante a 100%
        extra50 = Math.min(extraHoursDecimal, 2);
        extra100 = Math.max(0, extraHoursDecimal - 2);
    }

    // Calcula os valores monetários das horas extras
    const value50 = extra50 * salaryData.hourValue50;
    const value100 = extra100 * salaryData.hourValue100;
    const totalValue = value50 + value100;

    return {
        date: dateString,
        start: start,
        end: end,
        totalHours: totalHoursDecimal,
        isHoliday: isHoliday,
        isFriday: isFriday,
        isSaturday: isSaturday, // Adiciona o estado do sábado
        dayType: isSundayOrHolidayToday ? "Domingo/Feriado" : (isSaturday ? "Sábado" : (isFriday ? "Sexta-feira" : "Dia Útil")),
        extra50: extra50,
        value50: value50,
        extra100: extra100,
        value100: value100,
        totalValue: totalValue
    };
}


// --- PÁGINA DE CÁLCULO DE HORAS EXTRAS ---
/**
 * Carrega e exibe os registros de horas extras salvos no localStorage.
 */
function loadOvertimeRecords() {
    // Filtra apenas os registros do tipo 'extra'
    const records = (JSON.parse(localStorage.getItem('allWorkRecords')) || [])
                    .filter(r => r.type === 'extra');
    overtimeTableBody.innerHTML = ''; // Limpa a tabela
    
    records.forEach((record, index) => {
        addOvertimeToTable(record, index);
    });
    
    calculateOvertimeTotal(); // Recalcula o total geral
}

// Listener para adicionar um novo registro de hora extra
addOvertimeBtn.addEventListener('click', async () => {
    const dateInputVal = overtimeDateInput.value; // Pega o valor do input type="date" (YYYY-MM-DD)
    const endTime = document.getElementById('overtime-end').value;
    const isFriday = isFridayCheckbox.checked;
    const isSaturday = isSaturdayCheckbox.checked;
    const isHoliday = isHolidayOvertimeCheckbox.checked; // Usando a nova referência
    
    // Validação de campos
    if (!dateInputVal || !endTime) {
        await showCustomModal('Erro de Preenchimento', 'Por favor, preencha todos os campos obrigatórios.', 'alert');
        return;
    }

    // A validação isValidDate foi atualizada para aceitar YYYY-MM-DD
    if (!isValidDate(dateInputVal)) {
        await showCustomModal('Erro de Data', 'Formato de data inválido! Por favor, use o seletor de data.', 'alert');
        return;
    }
    const dateISO = dateInputVal; // A data já está no formato YYYY-MM-DD

    if (!isValidTime(endTime)) {
        await showCustomModal('Erro de Hora', 'Formato de hora inválido! Use HH:MM.', 'alert');
        return;
    }
    
    // Para cálculo de horas extras, a hora de início de trabalho é geralmente fixa (ex: 08:00)
    const startTime = "08:00"; 

    // Usa a função de cálculo centralizada
    const details = calculateOvertimeDetails(dateISO, startTime, endTime, isHoliday, isFriday, isSaturday);

    // Cria o objeto do registro de hora extra. A data será salva como DD/MM/AAAA para exibição na tabela.
    const record = {
        type: 'extra', // Identifica o tipo de registro
        date: formatDate(dateISO), // Converte para DD/MM/AAAA para salvar e exibir na tabela
        dateISO: dateISO, // Salva também a data ISO para facilitar ordenação/operações futuras se necessário
        start: details.start,
        end: details.end,
        totalHours: details.totalHours,
        isHoliday: details.isHoliday,
        isFriday: details.isFriday,
        isSaturday: details.isSaturday,
        hours50: details.extra50,
        value50: details.value50,
        hours100: details.extra100,
        value100: details.value100,
        totalValue: details.totalValue
    };
    
    // Salva no localStorage (unificado)
    const allRecords = JSON.parse(localStorage.getItem('allWorkRecords')) || [];
    allRecords.push(record);
    localStorage.setItem('allWorkRecords', JSON.stringify(allRecords));
    
    // Adiciona o registro na tabela
    addOvertimeToTable(record, allRecords.length - 1);
    
    calculateOvertimeTotal(); // Atualiza o total geral

    // Limpa os campos após adicionar
    overtimeDateInput.value = new Date().toISOString().split('T')[0]; // Define a data atual no formato YYYY-MM-DD
    document.getElementById('overtime-end').value = '17:45';
    isFridayCheckbox.checked = false;
    isSaturdayCheckbox.checked = false;
    isHolidayOvertimeCheckbox.checked = false; // Limpa a checkbox de Domingo/Feriado
});

/**
 * Adiciona um registro de hora extra à tabela na interface.
 * @param {object} record - O objeto de registro de hora extra.
 * @param {number} index - O índice do registro no array unificado `allWorkRecords`.
 */
function addOvertimeToTable(record, index) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${record.date}</td>
        <td>${record.start}</td>
        <td>${record.end}</td>
        <td>${formatDecimalHours(record.totalHours)}</td>
        <!-- Células ocultas, apenas para manter a estrutura e o índice da coluna -->
        <td class="hidden-column">${record.isHoliday ? 'X' : ''}</td>
        <td class="hidden-column">${record.isFriday ? 'X' : ''}</td>
        <td class="hidden-column">${record.isSaturday ? 'X' : ''}</td>
        <td>${formatDecimalHours(record.hours50)}</td>
        <td>${formatCurrency(record.value50)}</td>
        <td>${formatDecimalHours(record.hours100)}</td>
        <td>${formatCurrency(record.value100)}</td>
        <td>${formatCurrency(record.totalValue)}</td>
        <td>
            <button class="delete-btn" data-index="${index}" data-record-type="extra">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    overtimeTableBody.appendChild(row);
}

/**
 * Calcula e exibe o total geral das horas extras registradas.
 */
function calculateOvertimeTotal() {
    const records = (JSON.parse(localStorage.getItem('allWorkRecords')) || [])
                    .filter(r => r.type === 'extra'); // Soma apenas os registros do tipo 'extra'
    let total = 0;
    
    records.forEach(record => {
        total += record.totalValue;
    });
    
    totalOvertimeDisplay.textContent = `Total Geral: ${formatCurrency(total)}`;
}

// Listener para o botão 'Limpar Campos' na página de horas extras
clearOvertimeBtn.addEventListener('click', () => {
    // Apenas limpa os campos de input, não os registros salvos
    overtimeDateInput.value = new Date().toISOString().split('T')[0]; // Define a data atual no formato YYYY-MM-DD
    document.getElementById('overtime-end').value = '17:45';
    isFridayCheckbox.checked = false;
    isSaturdayCheckbox.checked = false;
    isHolidayOvertimeCheckbox.checked = false;
});

// Listener para o botão 'Exportar CSV'
exportOvertimeBtn.addEventListener('click', async () => {
    const records = (JSON.parse(localStorage.getItem('allWorkRecords')) || [])
                    .filter(r => r.type === 'extra'); // Exporta apenas os registros do tipo 'extra'
    
    if (records.length === 0) {
        await showCustomModal('Atenção', 'Não há registros de horas extras para exportar!', 'alert');
        return;
    }
    
    // Atualiza o cabeçalho do CSV para incluir todas as colunas, mesmo as ocultas
    let csvContent = "Data,Entrada,Saída,Horas Totais,Domingo/Feriado,Sexta,Sábado,H Extra 50%,Valor 50% R$,Extra 100%,Valor 100% R$,Cálculo Total\n";
    
    records.forEach(record => {
        // Usa a 'dateISO' se disponível para exportação, senão a 'date' formatada (que é DD/MM/AAAA)
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
    URL.revokeObjectURL(url); // Libera o URL do objeto
});


// --- Lógica de Deleção Unificada ---
/**
 * Adiciona um único listener de evento ao corpo da tabela para lidar com a deleção.
 * Isso é mais eficiente do que adicionar um listener para cada botão de exclusão.
 */
document.addEventListener('click', async (e) => {
    // Verifica se o clique foi em um botão de exclusão
    const deleteButton = e.target.closest('.delete-btn');
    if (deleteButton) {
        e.stopPropagation(); // Previne que o evento se propague para outros listeners

        const index = parseInt(deleteButton.dataset.index);
        const type = deleteButton.dataset.recordType;

        const confirmDelete = await showCustomModal(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir este registro?',
            'confirm'
        );

        if (confirmDelete) {
            let allRecords = JSON.parse(localStorage.getItem('allWorkRecords')) || [];
            
            // Remove o registro pelo índice
            if (index >= 0 && index < allRecords.length) {
                allRecords.splice(index, 1);
                localStorage.setItem('allWorkRecords', JSON.stringify(allRecords));

                // Recarrega a tabela correta com base no tipo de registro deletado
                if (type === 'extra') {
                    loadOvertimeRecords();
                }
            } else {
                await showCustomModal('Erro', 'Registro não encontrado para exclusão.', 'alert');
            }
        }
    }
});


// --- FUNÇÕES AUXILIARES ---
/**
 * Formata uma string de data (YYYY-MM-DD) para o formato local (DD/MM/AAAA).
 * @param {string} dateString - A data no formato YYYY-MM-DD.
 * @returns {string} A data formatada para DD/MM/AAAA.
 */
function formatDate(dateString) {
    // Adiciona 'T00:00:00' para garantir que a data seja interpretada em UTC e evite problemas de fuso horário
    // que podem mudar o dia se for um fuso horário negativo muito grande.
    const date = new Date(dateString + 'T00:00:00'); 
    return date.toLocaleDateString('pt-BR');
}

/**
 * Converte horas decimais para o formato HH:MM.
 * @param {number} decimalHours - As horas em formato decimal.
 * @returns {string} As horas formatadas como HH:MM.
 */
function formatDecimalHours(decimalHours) {
    if (isNaN(decimalHours) || decimalHours < 0) return "0:00";
    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Formata um valor numérico como moeda brasileira (R$).
 * @param {number} value - O valor numérico.
 * @returns {string} O valor formatado como R$ X.XX.
 */
function formatCurrency(value) {
    if (isNaN(value)) return "R$ 0,00";
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

/**
 * Valida se uma string de data está no formato YYYY-MM-DD (do input type=date) ou DD/MM/AAAA.
 * @param {string} dateString - A string de data para validar.
 * @returns {boolean} True se a data for válida, caso contrário False.
 */
function isValidDate(dateString) {
    // Verifica se a data é YYYY-MM-DD (formato do input type="date")
    const regexISO = /^\d{4}-\d{2}-\d{2}$/;
    if (regexISO.test(dateString)) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toISOString().slice(0,10) === dateString;
    }

    // Verifica se a data é DD/MM/AAAA (para casos onde o input de texto ainda é usado ou para compatibilidade)
    const regexBR = /^\d{2}\/\d{2}\/\d{4}$/;
    if (regexBR.test(dateString)) {
        const parts = dateString.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado
        const year = parseInt(parts[2], 10);
        
        const date = new Date(year, month, day);
        return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
    }
    return false;
}

/**
 * Valida se uma string de tempo está no formato HH:MM.
 * @param {string} timeString - A string de tempo para validar.
 * @returns {boolean} True se o tempo for válido, caso contrário False.
 */
function isValidTime(timeString) {
    const regex = /^\d{2}:\d{2}$/;
    if (!regex.test(timeString)) return false;
    
    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
}


// --- Inicialização ao Carregar a Página ---
document.addEventListener('DOMContentLoaded', () => {
    // Carrega dados de salário salvos ou usa padrões
    const savedSalary = localStorage.getItem('salaryData');
    if (savedSalary) {
        const salaryData = JSON.parse(savedSalary);
        document.getElementById('monthly-salary').value = salaryData.monthlySalary?.toFixed(2) || '3829.26';
        document.getElementById('hour-value-50').value = salaryData.hourValue50?.toFixed(2) || '26.10';
        document.getElementById('hour-value-100').value = salaryData.hourValue100?.toFixed(2) || '34.81';
        document.getElementById('normal-end-time').value = salaryData.normalEndTime || '17:44'; // Carrega hora de saída normal
    }

    // Define a data atual no formato YYYY-MM-DD para o input type="date"
    const today = new Date();
    overtimeDateInput.value = today.toISOString().split('T')[0];
});
