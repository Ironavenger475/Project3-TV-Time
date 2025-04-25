const loadingContainer = document.getElementById("loading-container");
const progressBar = document.getElementById("progress-bar");
const loadingMessage = document.getElementById("loading-msg");

function showLoading(message = "Loading...") {
    if (loadingContainer) loadingContainer.style.display = "block";
    updateLoadingMessage(message);
    updateProgressBar(0);
}

function hideLoading() {
    updateLoadingMessage("Loading complete");
    updateProgressBar(100);
    setTimeout(() => {
        if (loadingContainer) loadingContainer.style.display = "none";
    }, 100);
}

function updateLoadingMessage(message) {
    if (loadingMessage) {
        loadingMessage.innerHTML = message;
    }
}

function updateProgressBar(progress) {
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${Math.round(progress)}%`;
    }
}

// Webworker management
let worker;
let activePromise = null;

function createWorker() {
    const workerCode = `
        importScripts('https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js');
        self.onmessage = async (event) => {
            const { type, url } = event.data;
            
            if (type === 'load') {
                try {
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        throw new Error(\`HTTP error: \${response.status}\`);
                    }

                    const reader = response.body.getReader();
                    let receivedLength = 0;
                    let totalLength = parseInt(response.headers.get('content-length'), 10) || 0;
                    
                    while (true) {
                        const { done, value } = await reader.read();
                        
                        if (done) {
                            break;
                        }
                        
                        receivedLength += value.length;
                        const progress = Math.round((receivedLength / totalLength) * 100);
                        self.postMessage({ type: 'progress', progress });
                        
                        // Process chunks here if needed
                    }
                    
                    const chunks = [];
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        chunks.push(value);
                    }
                    
                    const text = chunks.join('');
                    const data = d3.csvParse(text);
                    self.postMessage({ type: 'rawData', data });
                } catch (error) {
                    self.postMessage({ 
                        type: 'error', 
                        message: error.message || 'An error occurred while loading the CSV'
                    });
                }
            }
        };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
}

function initializeWorker() {
    if (typeof Worker !== 'undefined') {
        worker = createWorker();
        worker.onmessage = (event) => {
            const { type, data, progress } = event.data;
            switch (type) {
                case 'progress':
                    updateProgressBar(progress);
                    break;
                case 'rawData':
                    try {
                        hideLoading();
                        activePromise?.resolve(data);
                    } catch (error) {
                        activePromise?.reject(new Error('Error parsing CSV: ' + error.message));
                    }
                    break;
                case 'error':
                    hideLoading();
                    activePromise?.reject(new Error(data));
                    break;
            }
        };
        
        worker.onerror = (error) => {
            hideLoading();
            activePromise?.reject(new Error('Worker error: ' + error.message));
        };
    } else {
        worker = {
            postMessage: (message) => {
                if (message.type === 'load') {
                    processCSVInChunks(message.url);
                }
            }
        };
    }
}

function loadData(url) {
    return new Promise((resolve, reject) => {
        showLoading("Loading Demon Slayer transcript...");
        
        if (!url) {
            reject(new Error('URL is required'));
            return;
        }

        const absoluteUrl = new URL(url, window.location.origin).href;
        initializeWorker();
        
        activePromise = { resolve, reject };
        worker.postMessage({ type: 'load', url: absoluteUrl });
    });
}

export { showLoading, hideLoading, updateLoadingMessage, updateProgressBar, loadData };