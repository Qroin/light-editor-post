document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;

    const controls = [
        { id: 'pagePaddingY', var: '--page-padding-y', unit: 'mm' },
        { id: 'pagePaddingX', var: '--page-padding-x', unit: 'mm' },
        { id: 'headerPadding', var: '--header-padding', unit: 'mm' },
        { id: 'headerFontSize', var: '--header-font-size', unit: 'pt' },
        { id: 'headerLineHeight', var: '--header-line-height', unit: '' },
        { id: 'bodyPadding', var: '--body-padding', unit: 'mm' },
        { id: 'contentFontSize', var: '--content-font-size', unit: 'pt' },
        { id: 'contentLineHeight', var: '--content-line-height', unit: '' }
    ];

    controls.forEach(control => {
        const input = document.getElementById(control.id);
        const display = document.getElementById(control.id + 'Val');

        input.addEventListener('input', (e) => {
            const val = e.target.value;
            display.textContent = val;
            root.style.setProperty(control.var, val + control.unit);
        });
    });

    updatePageNumbers();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Add Dynamic Header Item
function addHeaderItem() {
    const container = document.getElementById('headerContainer');
    const item = document.createElement('div');
    item.className = 'info-item';
    item.innerHTML = `
        <span class="info-label" contenteditable="true">항목명</span>
        <div class="info-content" contenteditable="true">내용을 입력하세요.</div>
        <div class="item-controls">
            <button class="move-btn" onclick="moveItemUp(this)">▲</button>
            <button class="move-btn" onclick="moveItemDown(this)">▼</button>
            <button class="delete-btn" onclick="this.closest('.info-item').remove(); updatePageNumbers();">×</button>
        </div>
    `;
    container.appendChild(item);
}

// Add Dynamic Body Section
function addBodySection() {
    const contents = document.querySelectorAll('.content');
    const lastContent = contents[contents.length - 1];

    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = `
        <div class="section-num" contenteditable="true"></div>
        <div class="section-main">
            <div class="section-text" contenteditable="true">새 섹션 내용을 입력하세요.</div>
        </div>
        <div class="item-controls">
            <button class="move-btn" onclick="moveItemUp(this)">▲</button>
            <button class="move-btn" onclick="moveItemDown(this)">▼</button>
            <button class="delete-btn" onclick="this.closest('.section').remove(); updatePageNumbers(); reorderSectionNumbers();">×</button>
        </div>
    `;
    lastContent.appendChild(section);
    reorderSectionNumbers();
}

function reorderSectionNumbers() {
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
        const num = section.querySelector('.section-num');
        num.textContent = `${index + 1}.`;
    });
}

function moveItemUp(btn) {
    const item = btn.closest('.info-item') || btn.closest('.section');
    const prev = item.previousElementSibling;
    if (prev && (prev.classList.contains('info-item') || prev.classList.contains('section'))) {
        item.parentElement.insertBefore(item, prev);
        if (item.classList.contains('section')) reorderSectionNumbers();
    }
}

function moveItemDown(btn) {
    const item = btn.closest('.info-item') || btn.closest('.section');
    const next = item.nextElementSibling;
    if (next && (next.classList.contains('info-item') || next.classList.contains('section'))) {
        item.parentElement.insertBefore(next, item);
        if (item.classList.contains('section')) reorderSectionNumbers();
    }
}

// Manual Page Management
function addPage() {
    const wrapper = document.getElementById('document-wrapper');
    const totalPages = document.querySelectorAll('.page').length;
    const newPageNum = totalPages + 1;

    const page = document.createElement('div');
    page.className = 'page';
    page.id = `page-${newPageNum}`;

    const content = document.createElement('div');
    content.className = 'content';
    content.id = `bodyContainer-${newPageNum}`;
    page.appendChild(content);

    const footer = document.createElement('div');
    footer.className = 'page-footer';
    page.appendChild(footer);

    wrapper.appendChild(page);
    updatePageNumbers();
}

function deleteLastPage() {
    const pages = document.querySelectorAll('.page');
    if (pages.length > 1) {
        pages[pages.length - 1].remove();
        updatePageNumbers();
    }
}

function updatePageNumbers() {
    const pages = document.querySelectorAll('.page');
    const total = pages.length;

    pages.forEach((page, index) => {
        const footer = page.querySelector('.page-footer');
        if (total > 1) {
            footer.style.display = 'block';
            footer.textContent = `- ${index + 1} / ${total} -`;
        } else {
            footer.style.display = 'none';
        }
    });
}

// Text Formatting
function formatDoc(command, value = null) {
    document.execCommand(command, false, value);
}

function insertTable() {
    const rowsInput = document.getElementById('tableRows');
    const colsInput = document.getElementById('tableCols');

    const rows = rowsInput.value;
    const cols = colsInput.value;

    if (!rows || !cols || isNaN(rows) || isNaN(cols)) return;

    let tableHtml = '<table class="page-table"><tbody>';
    for (let i = 0; i < parseInt(rows); i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
            if (i === 0) {
                tableHtml += '<th contenteditable="true">제목</th>';
            } else {
                tableHtml += '<td contenteditable="true">내용</td>';
            }
        }
        tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table>';

    document.execCommand('insertHTML', false, tableHtml);
}

function setCellColor(color) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    let container = selection.anchorNode;
    // Walk up to find the closest TD or TH
    while (container && container !== document.body) {
        if (container.nodeName === 'TD' || container.nodeName === 'TH') {
            container.style.backgroundColor = color;
            return;
        }
        container = container.parentElement;
    }
}

// Data Persistence (Save/Load)
function saveDocument() {
    const docData = {
        config: {},
        headerHtml: document.getElementById('headerContainer').innerHTML,
        pages: []
    };

    // Save slider configurations
    const controls = [
        'pagePaddingY', 'pagePaddingX', 'headerPadding', 'headerFontSize',
        'headerLineHeight', 'bodyPadding', 'contentFontSize', 'contentLineHeight'
    ];

    controls.forEach(id => {
        const input = document.getElementById(id);
        if (input) docData.config[id] = input.value;
    });

    // Save page contents
    const contentAreas = document.querySelectorAll('.content');
    contentAreas.forEach(area => {
        docData.pages.push(area.innerHTML);
    });

    // Create and download file
    const blob = new Blob([JSON.stringify(docData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `공문_${new Date().toISOString().slice(0, 10)}.json`;
    
    // Append to body for mobile browser compatibility
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

function printDocument() {
    // Small delay to ensure any open UI (like sidebar) is ready or to avoid mobile browser blocks
    setTimeout(() => {
        window.print();
    }, 200);
}

function loadDocument(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const docData = JSON.parse(e.target.result);
        const root = document.documentElement;

        // 1. Restore Config
        const controlSpecs = [
            { id: 'pagePaddingY', var: '--page-padding-y', unit: 'mm' },
            { id: 'pagePaddingX', var: '--page-padding-x', unit: 'mm' },
            { id: 'headerPadding', var: '--header-padding', unit: 'mm' },
            { id: 'headerFontSize', var: '--header-font-size', unit: 'pt' },
            { id: 'headerLineHeight', var: '--header-line-height', unit: '' },
            { id: 'bodyPadding', var: '--body-padding', unit: 'mm' },
            { id: 'contentFontSize', var: '--content-font-size', unit: 'pt' },
            { id: 'contentLineHeight', var: '--content-line-height', unit: '' }
        ];

        for (const id in docData.config) {
            const input = document.getElementById(id);
            const display = document.getElementById(id + 'Val');
            const val = docData.config[id];

            if (input) {
                input.value = val;
                if (display) display.textContent = val;

                const spec = controlSpecs.find(s => s.id === id);
                if (spec) {
                    root.style.setProperty(spec.var, val + spec.unit);
                }
            }
        }

        // 2. Restore Pages and Content
        const wrapper = document.getElementById('document-wrapper');
        wrapper.innerHTML = ''; // Clear existing pages

        docData.pages.forEach((pageContent, index) => {
            const pageNum = index + 1;
            const page = document.createElement('div');
            page.className = 'page';
            page.id = `page-${pageNum}`;

            // Restore Header (only for page 1)
            if (index === 0) {
                const header = document.createElement('div');
                header.className = 'header-info';
                header.id = 'headerContainer';
                header.innerHTML = docData.headerHtml;
                page.appendChild(header);
            }

            // Restore Content
            const content = document.createElement('div');
            content.className = 'content';
            content.id = `bodyContainer-${pageNum}`;
            content.innerHTML = pageContent;
            page.appendChild(content);

            // Add Footer
            const footer = document.createElement('div');
            footer.className = 'page-footer';
            page.appendChild(footer);

            wrapper.appendChild(page);
        });

        updatePageNumbers();
        event.target.value = ''; // Reset file input
    };
    reader.readAsText(file);
}
