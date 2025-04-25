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
    }, 300);
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
                    // Create Promise wrapper for XHR
                    const fetchData = new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        
                        // Add error handling
                        xhr.onerror = () => {
                            reject(new Error('Network error while loading CSV'));
                        };
                        
                        // Handle progress updates
                        xhr.onprogress = (event) => {
                            if (event.lengthComputable) {
                                const progress = Math.round((event.loaded / event.total) * 100);
                                self.postMessage({ 
                                    type: 'progress', 
                                    progress 
                                });
                            }
                        };
                        
                        // Handle successful load
                        xhr.onload = () => {
                            if (xhr.status === 200) {
                                try {
                                    const data = d3.csvParse(xhr.responseText);
                                    resolve(data);
                                } catch (parseError) {
                                    reject(new Error("Failed to parse CSV: " + parseError.message));
                                }
                            } else {
                                reject(new Error("Failed to load CSV: Status " + xhr.status));
                            }
                        };
                        
                        // Make the request
                        xhr.open('GET', url, true);
                        xhr.send();
                    });
                    
                    // Handle the promise
                    fetchData
                        .then(data => {
                            self.postMessage({ 
                                type: 'rawData', 
                                data 
                            });
                        })
                        .catch(error => {
                            self.postMessage({
                                type: 'error',
                                message: error.message || 'An error occurred while loading the CSV'
                            });
                        });
                } catch (error) {
                    self.postMessage({
                        type: 'error',
                        message: error.message || 'An error occurred while initializing the request'
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
                        updateLoadingMessage("Drawing Visualizations");
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