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
    
    // Focus on the main input for scientific mode
    if (mode === 'scientific' && mainInput) {
      mainInput.focus();
    }
    
    // Focus on graph input for graphing mode
    if (mode === 'graphing') {
      const graphInput = document.getElementById('graph-inp-1');
      if (graphInput) graphInput.focus();
    }
  });
});

// --- Scientific Logic ---
function performCalculation() {
  const input = mainInput.value.trim();
  if (!input) return;

  try {
    // Parse the input first for better error handling
    const node = math.parse(input);
    const result = node.evaluate();
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
    const node = typeof result === 'string' ? math.parse(result) : result;
    katex.render(node.toTex(), resEl, { throwOnError: false });
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

// Improved addText function to handle multiple arguments
function addText(text, ...args) {
  if (!mainInput) return;
  
  // If there are additional arguments, append them
  let fullText = text;
  if (args.length > 0) {
    fullText += args.join('');
  }
  
  const start = mainInput.selectionStart;
  const end = mainInput.selectionEnd;
  const current = mainInput.value;
  mainInput.value = current.substring(0, start) + fullText + current.substring(end);
  mainInput.focus();
  mainInput.setSelectionRange(start + fullText.length, start + fullText.length);
}

// Global exposure for inline onclick handlers
window.addText = addText;
window.performCalculation = performCalculation;

// --- Graphing Logic ---
function plot() {
  const inputEl = document.getElementById('graph-inp-1');
  const containerEl = document.getElementById('graph-container');
  if (!inputEl || !containerEl) return;
  
  const fn = inputEl.value || 'sin(x)';
  try {
    // Clear previous plot
    containerEl.innerHTML = '';
    
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
      },
      // Dark mode styling for function-plot
      xAxis: {
        label: 'x',
        domain: [-10, 10]
      },
      yAxis: {
        label: 'f(x)',
        domain: [-10, 10]
      }
    });
  } catch (e) {
    console.error("Plot error:", e);
    containerEl.innerHTML = '<div style="color: var(--danger); padding: 20px; text-align: center;">Error plotting function. Please check your input.</div>';
  }
}

window.plot = plot;

// --- Calculus Logic ---
function doCalculus(type) {
  const input = type === 'diff' ? document.getElementById('calc-diff-inp').value : document.getElementById('calc-int-inp').value;
  const resEl = type === 'diff' ? document.getElementById('calc-diff-res') : document.getElementById('calc-int-res');
  if(!resEl) return;
  
  // Clear previous errors
  resEl.style.color = '';
  
  try {
    if (type === 'diff') {
      const res = math.derivative(input, 'x');
      katex.render(res.toTex(), resEl, { displayMode: true });
    } else {
      // Use math.js for symbolic integration
      const res = math.integrate(input, 'x');
      katex.render(res.toTex(), resEl, { displayMode: true });
    }
  } catch (err) {
    console.error("Calculus error:", err);
    resEl.innerHTML = "Error in expression: " + err.message;
    resEl.style.color = "var(--danger)";
    setTimeout(() => {
      resEl.style.color = "var(--success)";
      resEl.textContent = '';
    }, 3000);
  }
}
window.doCalculus = doCalculus;

// --- Matrix Logic ---
function matrixOp(op) {
  const a = document.getElementById('mat-a').value;
  const b = document.getElementById('mat-b').value;
  const resEl = document.getElementById('mat-res');
  if(!resEl) return;

  // Clear previous errors
  resEl.style.color = '';

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
      // Check if matrix is square
      if (matA.length !== matA[0].length) {
        throw new Error("Matrix must be square for inversion");
      }
      result = math.inv(matA);
    }

    // Format the result for display
    const resultStr = math.format(result, { precision: 10 });
    try {
      const node = typeof resultStr === 'string' ? math.parse(resultStr) : result;
      katex.render(node.toTex(), resEl, { displayMode: true });
    } catch {
      resEl.textContent = resultStr;
    }
  } catch (err) {
    console.error("Matrix error:", err);
    resEl.textContent = "Operation failed: " + err.message;
    resEl.style.color = "var(--danger)";
    setTimeout(() => {
      resEl.style.color = "var(--success)";
    }, 3000);
  }
}
window.matrixOp = matrixOp;

// Initial Setup
window.addEventListener('resize', () => {
    // Re-plot if graphing is active
    if (document.getElementById('graphing') && document.getElementById('graphing').classList.contains('active')) {
        setTimeout(plot, 100); // Small delay to allow container to resize
    }
});

// Initialize on load
window.addEventListener('load', () => {
  // Focus on main input
  if (mainInput) {
    mainInput.focus();
  }
});
