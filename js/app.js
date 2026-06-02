// --- DOM Elements ---
const navItems = document.querySelectorAll('.nav-item');
const modeContainers = document.querySelectorAll('.mode-container');
const mainInput = document.getElementById('main-input');
const calcBtn = document.getElementById('calc-btn');
const scientificHistory = document.getElementById('history-scientific');

// --- Sidebar Navigation Logic ---
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const mode = item.getAttribute('data-mode');
    
    // Update UI
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    
    modeContainers.forEach(container => {
      container.classList.remove('active');
      if (container.id === mode) container.classList.add('active');
    });

    // Initialize mode-specific logic
    if (mode === 'graphing') {
      // Need a slight delay for the container to become visible before rendering
      setTimeout(plot, 100); 
    }
  });
});

// --- Scientific Logic ---
function performCalculation() {
  const input = mainInput.value.trim();
  if (!input) return;

  try {
    const result = math.evaluate(input);
    const resultStr = math.format(result, { precision: 14 });
    
    addToHistory(input, resultStr);
    mainInput.value = '';
  } catch (err) {
    console.error(err);
    mainInput.style.border = '1px solid var(--danger)';
    mainInput.style.boxShadow = '0 0 10px var(--danger)';
    setTimeout(() => {
        mainInput.style.border = 'none';
        mainInput.style.boxShadow = 'none';
    }, 1000);
  }
}

function addToHistory(input, result) {
  const item = document.createElement('div');
  item.className = 'history-item';
  
  const inEl = document.createElement('div');
  inEl.className = 'history-input';
  inEl.textContent = input;

  const resEl = document.createElement('div');
  resEl.className = 'history-result';
  
  // Try rendering LaTeX
  try {
    katex.render(math.parse(result).toTex(), resEl, { throwOnError: false });
  } catch {
    resEl.textContent = result;
  }

  item.appendChild(inEl);
  item.appendChild(resEl);
  scientificHistory.insertBefore(item, scientificHistory.firstChild);
}

if (calcBtn) {
    calcBtn.addEventListener('click', performCalculation);
}

if (mainInput) {
    mainInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performCalculation();
    });
}

function addText(text, suffix = '') {
  if (!mainInput) return;
  const start = mainInput.selectionStart;
  const end = mainInput.selectionEnd;
  const current = mainInput.value;
  mainInput.value = current.substring(0, start) + text + suffix + current.substring(end);
  mainInput.focus();
  mainInput.setSelectionRange(start + text.length, start + text.length);
}

// Global exposure for inline onclick handlers (or we could use event listeners)
window.addText = addText;
window.performCalculation = performCalculation;

// --- Graphing Logic ---
function plot() {
  const inputEl = document.getElementById('graph-inp-1');
  const containerEl = document.getElementById('graph-container');
  if (!inputEl || !containerEl) return;
  
  const fn = inputEl.value || 'sin(x)';
  try {
    functionPlot({
      target: '#graph-container',
      width: containerEl.offsetWidth,
      height: containerEl.offsetHeight || 500, // Fallback height
      grid: true,
      data: [{
        fn: fn,
        sampler: 'builtIn',
        graphType: 'polyline'
      }],
      tip: {
        xLine: true,
        yLine: true,
        renderer: function (x, y, index) {
          return 'f(' + x.toFixed(2) + ') = ' + y.toFixed(2);
        }
      }
    });
  } catch (e) {
    console.error("Plot error:", e);
  }
}

window.plot = plot;

// --- Calculus Logic ---
function doCalculus(type) {
  const input = type === 'diff' ? document.getElementById('calc-diff-inp').value : document.getElementById('calc-int-inp').value;
  const resEl = type === 'diff' ? document.getElementById('calc-diff-res') : document.getElementById('calc-int-res');
  if(!resEl) return;
  
  try {
    if (type === 'diff') {
      const res = math.derivative(input, 'x');
      katex.render(res.toTex(), resEl, { displayMode: true });
    } else {
      // Numerical integration fallback message
      resEl.innerHTML = `<span style="color:var(--warning); font-size:1rem;">Symbolic integration is complex.<br/>Try standard scientific mode for numerical eval: <code>integrate('${input}', 'x', 0, 1)</code></span>`;
    }
  } catch (err) {
    resEl.textContent = "Error in expression";
    resEl.style.color = "var(--danger)";
    setTimeout(() => resEl.style.color = "inherit", 2000);
  }
}
window.doCalculus = doCalculus;

// --- Matrix Logic ---
function matrixOp(op) {
  const a = document.getElementById('mat-a').value;
  const b = document.getElementById('mat-b').value;
  const resEl = document.getElementById('mat-res');
  if(!resEl) return;

  try {
    const matA = math.matrix(math.evaluate(a));
    let result;

    if (op === 'add') {
      const matB = math.matrix(math.evaluate(b));
      result = math.add(matA, matB);
    } else if (op === 'multiply') {
      const matB = math.matrix(math.evaluate(b));
      result = math.multiply(matA, matB);
    } else if (op === 'det') {
      result = math.det(matA);
    } else if (op === 'inv') {
      result = math.inv(matA);
    }

    katex.render(math.parse(math.format(result)).toTex(), resEl, { displayMode: true });
  } catch (err) {
    resEl.textContent = "Operation failed. Check dimensions or format.";
    resEl.style.color = "var(--danger)";
    setTimeout(() => resEl.style.color = "inherit", 2000);
  }
}
window.matrixOp = matrixOp;

// Initial Setup
window.addEventListener('resize', () => {
    // Re-plot if graphing is active
    if (document.getElementById('graphing').classList.contains('active')) {
        plot();
    }
});
