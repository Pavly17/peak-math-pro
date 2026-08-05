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
    
    // Focus on the appropriate input for each mode
    setTimeout(() => {
      if (mode === 'scientific') {
        const mainInp = document.getElementById('main-input');
        if (mainInp) mainInp.focus();
      } else if (mode === 'graphing') {
        const graphInput = document.getElementById('graph-inp-1');
        if (graphInput) graphInput.focus();
      } else if (mode === 'calculus') {
        const calcInput = document.getElementById('calc-diff-inp');
        if (calcInput) calcInput.focus();
      } else if (mode === 'linear') {
        const matInput = document.getElementById('mat-a');
        if (matInput) matInput.focus();
      }
    }, 50);
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
  
  // Try rendering LaTeX with better error handling
  try {
    if (result && typeof result === 'object' && typeof result.toTex === 'function') {
      katex.render(result.toTex(), resEl, { throwOnError: false });
    } else if (typeof result === 'string') {
      // Try to parse and render
      try {
        const node = math.parse(result);
        if (node && typeof node.toTex === 'function') {
          katex.render(node.toTex(), resEl, { throwOnError: false });
        } else {
          resEl.textContent = result;
        }
      } catch (parseErr) {
        resEl.textContent = result;
      }
    } else {
      resEl.textContent = String(result);
    }
  } catch (katexErr) {
    console.warn("KaTeX rendering failed:", katexErr);
    resEl.textContent = String(result);
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

// Add Enter key support for graphing input
const graphInput = document.getElementById('graph-inp-1');
if (graphInput) {
  graphInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      plot();
    }
  });
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
      // Check if matrix is square before calculating determinant
      const size = matA.size();
      if (size.length !== 2 || size[0] !== size[1]) {
        throw new Error("Matrix must be square for determinant");
      }
      result = math.det(matA);
    } else if (op === 'inv') {
      // Check if matrix is square
      const size = matA.size();
      if (size.length !== 2 || size[0] !== size[1]) {
        throw new Error("Matrix must be square for inversion");
      }
      result = math.inv(matA);
    }

    // Format the result for display
    const resultStr = math.format(result, { precision: 10 });
    
    // Try to render as LaTeX, but handle matrices and simple values gracefully
    try {
      if (result && typeof result.toTex === 'function') {
        katex.render(result.toTex(), resEl, { displayMode: true });
      } else if (Array.isArray(result) || (result && typeof result === 'object')) {
        // For matrices or complex objects, show formatted text
        resEl.textContent = resultStr;
        resEl.style.fontSize = '1.2rem';
        resEl.style.textAlign = 'center';
      } else {
        // For simple values, try to parse and render
        const node = typeof resultStr === 'string' ? math.parse(resultStr) : result;
        if (node && typeof node.toTex === 'function') {
          katex.render(node.toTex(), resEl, { displayMode: true });
        } else {
          resEl.textContent = resultStr;
        }
      }
    } catch (latexErr) {
      console.warn("LaTeX rendering failed:", latexErr);
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

// --- Theme Toggle ---
let isDarkTheme = true;

function toggleTheme() {
  isDarkTheme = !isDarkTheme;
  document.body.classList.toggle('light-theme');
  
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  
  if (sunIcon && moonIcon) {
    sunIcon.style.display = isDarkTheme ? 'block' : 'none';
    moonIcon.style.display = isDarkTheme ? 'none' : 'block';
  }
  
  localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  toggleTheme();
}

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
  // Ctrl + number for mode switching
  if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
    e.preventDefault();
    const modes = ['scientific', 'graphing', 'graphing3d', 'calculus', 'diffeq', 'statistics', 'geometry', 'linear', 'physics'];
    const modeIndex = parseInt(e.key) - 1;
    if (modes[modeIndex]) {
      const navItem = document.querySelector(`.nav-item[data-mode="${modes[modeIndex]}"]`);
      if (navItem) navItem.click();
    }
  }
  
  // Show shortcuts with ?
  if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
    // Only if not in an input field
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      showShortcuts();
    }
  }
  
  // Close modal with Escape
  if (e.key === 'Escape') {
    closeShortcuts();
  }
});

function showShortcuts() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) modal.style.display = 'flex';
}

function closeShortcuts() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) modal.style.display = 'none';
}

// --- Progress Bar ---
function showProgress(show) {
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.display = show ? 'block' : 'none';
    if (show) {
      setTimeout(() => {
        const bar = progressBar.querySelector('.progress-bar');
        if (bar) bar.style.width = '100%';
      }, 100);
    } else {
      const bar = progressBar.querySelector('.progress-bar');
      if (bar) bar.style.width = '0%';
    }
  }
}

// --- PDF Export ---
async function exportToPDF() {
  showProgress(true);
  
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Peak Math Pro - Calculation Results', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 20, 30);
    
    let yPosition = 50;
    
    // Get scientific history
    const history = document.getElementById('history-scientific');
    if (history && history.children.length > 0) {
      doc.setFontSize(14);
      doc.text('Scientific Calculations:', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      const items = Array.from(history.children).slice(0, 20); // Limit to 20 items
      items.forEach((item, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        const input = item.querySelector('.history-input');
        const result = item.querySelector('.history-result');
        if (input && result) {
          doc.text(`${index + 1}. ${input.textContent} = ${result.textContent}`, 20, yPosition);
          yPosition += 8;
        }
      });
    }
    
    // Save the PDF
    doc.save(`peak-math-pro-${Date.now()}.pdf`);
  } catch (err) {
    console.error('PDF export error:', err);
    alert('Error exporting PDF. Please try again.');
  } finally {
    showProgress(false);
  }
}

// --- 3D Graphing ---
function plot3D() {
  const inputEl = document.getElementById('graph3d-inp');
  const containerEl = document.getElementById('graph3d-container');
  if (!inputEl || !containerEl) return;
  
  showProgress(true);
  
  const fnStr = inputEl.value || 'sin(sqrt(x^2 + y^2))';
  
  try {
    containerEl.innerHTML = '';
    
    // Generate data for 3D plot
    const xValues = [];
    const yValues = [];
    const zValues = [];
    
    const range = 5;
    const step = 0.5;
    
    for (let x = -range; x <= range; x += step) {
      for (let y = -range; y <= range; y += step) {
        xValues.push(x);
        yValues.push(y);
        
        try {
          const expr = math.parse(fnStr);
          const scope = { x, y };
          const z = expr.evaluate(scope);
          zValues.push(typeof z === 'number' ? z : 0);
        } catch (e) {
          zValues.push(0);
        }
      }
    }
    
    const trace = {
      x: xValues,
      y: yValues,
      z: zValues,
      type: 'surface',
      colorscale: 'Viridis'
    };
    
    const layout = {
      title: `3D Plot: z = ${fnStr}`,
      scene: {
        xaxis: { title: 'X' },
        yaxis: { title: 'Y' },
        zaxis: { title: 'Z' }
      },
      margin: { l: 0, r: 0, t: 50, b: 0 }
    };
    
    Plotly.newPlot(containerEl, [trace], layout, { responsive: true });
  } catch (err) {
    console.error('3D plot error:', err);
    containerEl.innerHTML = `<div style="color: var(--danger); padding: 20px; text-align: center;">Error plotting: ${err.message}</div>`;
  } finally {
    showProgress(false);
  }
}

// --- Differential Equations Solver ---
function solveODE() {
  const eqInput = document.getElementById('ode-inp');
  const icInput = document.getElementById('ode-ic');
  const rangeInput = document.getElementById('ode-range');
  const resEl = document.getElementById('ode-res');
  const plotEl = document.getElementById('ode-plot');
  
  if (!eqInput || !icInput || !rangeInput || !resEl || !plotEl) return;
  
  showProgress(true);
  
  try {
    const fStr = eqInput.value || 'y';
    const y0 = parseFloat(icInput.value) || 1;
    const range = math.evaluate(rangeInput.value) || [0, 10];
    
    // Simple Euler method for numerical solution
    const steps = 100;
    const h = (range[1] - range[0]) / steps;
    const xValues = [];
    const yValues = [];
    
    let x = range[0];
    let y = y0;
    
    for (let i = 0; i <= steps; i++) {
      xValues.push(x);
      yValues.push(y);
      
      try {
        const expr = math.parse(fStr);
        const dydx = expr.evaluate({ x, y });
        y = y + h * dydx;
        x = x + h;
      } catch (e) {
        break;
      }
    }
    
    // Display solution info
    resEl.innerHTML = `<p>Numerical solution using Euler's method (${steps} steps)</p><p>Initial condition: y(${range[0]}) = ${y0}</p>`;
    
    // Plot the solution
    const trace = {
      x: xValues,
      y: yValues,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#3b82f6', width: 2 }
    };
    
    const layout = {
      title: 'ODE Solution',
      xaxis: { title: 'x' },
      yaxis: { title: 'y' },
      margin: { l: 50, r: 20, t: 40, b: 50 }
    };
    
    Plotly.newPlot(plotEl, [trace], layout, { responsive: true });
  } catch (err) {
    console.error('ODE error:', err);
    resEl.innerHTML = `<p style="color: var(--danger);">Error: ${err.message}</p>`;
  } finally {
    showProgress(false);
  }
}

// --- Statistics Calculator ---
function calcStats() {
  const dataInput = document.getElementById('stats-data');
  const resEl = document.getElementById('stats-res');
  
  if (!dataInput || !resEl) return;
  
  try {
    const dataStr = dataInput.value;
    const data = dataStr.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    
    if (data.length === 0) {
      resEl.innerHTML = '<p style="color: var(--danger);">Please enter valid numbers separated by commas.</p>';
      return;
    }
    
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const sorted = [...data].sort((a, b) => a - b);
    const median = n % 2 === 0 
      ? (sorted[n/2 - 1] + sorted[n/2]) / 2 
      : sorted[Math.floor(n/2)];
    
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    
    resEl.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
        <div class="card" style="padding: 15px; margin: 0;">
          <strong style="color: var(--accent);">Count</strong>
          <div style="font-size: 1.5rem; color: var(--text-main);">${n}</div>
        </div>
        <div class="card" style="padding: 15px; margin: 0;">
          <strong style="color: var(--accent);">Mean</strong>
          <div style="font-size: 1.5rem; color: var(--text-main);">${mean.toFixed(4)}</div>
        </div>
        <div class="card" style="padding: 15px; margin: 0;">
          <strong style="color: var(--accent);">Median</strong>
          <div style="font-size: 1.5rem; color: var(--text-main);">${median.toFixed(4)}</div>
        </div>
        <div class="card" style="padding: 15px; margin: 0;">
          <strong style="color: var(--accent);">Std Deviation</strong>
          <div style="font-size: 1.5rem; color: var(--text-main);">${stdDev.toFixed(4)}</div>
        </div>
        <div class="card" style="padding: 15px; margin: 0;">
          <strong style="color: var(--accent);">Variance</strong>
          <div style="font-size: 1.5rem; color: var(--text-main);">${variance.toFixed(4)}</div>
        </div>
        <div class="card" style="padding: 15px; margin: 0;">
          <strong style="color: var(--accent);">Range</strong>
          <div style="font-size: 1.5rem; color: var(--text-main);">${min.toFixed(4)} to ${max.toFixed(4)}</div>
        </div>
        <div class="card" style="padding: 15px; margin: 0;">
          <strong style="color: var(--accent);">Q1 (25th %ile)</strong>
          <div style="font-size: 1.5rem; color: var(--text-main);">${q1 !== undefined ? q1.toFixed(4) : 'N/A'}</div>
        </div>
        <div class="card" style="padding: 15px; margin: 0;">
          <strong style="color: var(--accent);">Q3 (75th %ile)</strong>
          <div style="font-size: 1.5rem; color: var(--text-main);">${q3 !== undefined ? q3.toFixed(4) : 'N/A'}</div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Statistics error:', err);
    resEl.innerHTML = `<p style="color: var(--danger);">Error: ${err.message}</p>`;
  }
}

function setStatsExample(example) {
  const input = document.getElementById('stats-data');
  if (input) {
    input.value = example;
    calcStats();
  }
}

// --- Geometric Transformations ---
function geoTransform(type, param) {
  const pointInput = document.getElementById('geo-point');
  const resEl = document.getElementById('geo-res');
  const plotEl = document.getElementById('geo-plot');
  
  if (!pointInput || !resEl || !plotEl) return;
  
  try {
    let points = math.evaluate(pointInput.value);
    
    // Ensure points is a 2D array
    if (Array.isArray(points) && typeof points[0] === 'number') {
      points = [points];
    }
    
    let transformed = [];
    let transformationName = '';
    
    if (type === 'rotate') {
      const angleRad = param * Math.PI / 180;
      const cosA = Math.cos(angleRad);
      const sinA = Math.sin(angleRad);
      
      transformed = points.map(p => [
        p[0] * cosA - p[1] * sinA,
        p[0] * sinA + p[1] * cosA
      ]);
      transformationName = `Rotation by ${param}°`;
    } else if (type === 'scale') {
      transformed = points.map(p => [p[0] * param, p[1] * param]);
      transformationName = `Scale by ${param}x`;
    } else if (type === 'reflect') {
      if (param === 'x') {
        transformed = points.map(p => [p[0], -p[1]]);
        transformationName = 'Reflection across X-axis';
      } else {
        transformed = points.map(p => [-p[0], p[1]]);
        transformationName = 'Reflection across Y-axis';
      }
    }
    
    // Format result
    const formattedResult = transformed.map(p => `[${p[0].toFixed(4)}, ${p[1].toFixed(4)}]`).join(', ');
    resEl.innerHTML = `<p><strong>${transformationName}:</strong></p><p style="font-family: 'Fira Code', monospace; font-size: 1.1rem;">${formattedResult}</p>`;
    
    // Plot original and transformed
    const origTrace = {
      x: points.map(p => p[0]),
      y: points.map(p => p[1]),
      mode: 'markers+lines',
      type: 'scatter',
      name: 'Original',
      marker: { color: '#3b82f6', size: 10 },
      line: { color: '#3b82f6', dash: 'dash' }
    };
    
    const transTrace = {
      x: transformed.map(p => p[0]),
      y: transformed.map(p => p[1]),
      mode: 'markers+lines',
      type: 'scatter',
      name: 'Transformed',
      marker: { color: '#10b981', size: 10 },
      line: { color: '#10b981' }
    };
    
    const layout = {
      title: 'Geometric Transformation',
      xaxis: { title: 'X', scaleanchor: 'y', scaleratio: 1 },
      yaxis: { title: 'Y' },
      showlegend: true,
      margin: { l: 50, r: 20, t: 40, b: 50 }
    };
    
    Plotly.newPlot(plotEl, [origTrace, transTrace], layout, { responsive: true });
  } catch (err) {
    console.error('Geometry error:', err);
    resEl.innerHTML = `<p style="color: var(--danger);">Error: ${err.message}</p>`;
  }
}

function customRotate() {
  const angle = prompt('Enter rotation angle in degrees:');
  if (angle !== null) {
    geoTransform('rotate', parseFloat(angle));
  }
}

// Expose functions globally
window.toggleTheme = toggleTheme;
window.showShortcuts = showShortcuts;
window.closeShortcuts = closeShortcuts;
window.exportToPDF = exportToPDF;
window.plot3D = plot3D;
window.solveODE = solveODE;
window.calcStats = calcStats;
window.setStatsExample = setStatsExample;
window.geoTransform = geoTransform;
window.customRotate = customRotate;
