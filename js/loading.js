const loadingContainer = document.getElementById("loading-container");
const progressBar = document.getElementById("progress-bar");
const loadingMessage = document.getElementById("loading-msg");

function showLoading(message = "Loading...") {
    if (loadingContainer) loadingContainer.style.display = "block";
    updateLoadingMessage(message);
    updateProgressBar(0);
}

async function hideLoading() {
    updateLoadingMessage("Loading complete");
    updateProgressBar(100);
    setTimeout(() => {
        if (loadingContainer) loadingContainer.style.display = "none";
    }, 1000);
}

function updateLoadingMessage(message) {
    if (loadingMessage) {
        requestAnimationFrame(() => {
            loadingMessage.innerHTML = message;
        });
    }
}

function updateProgressBar(progress) {
    if (progressBar) {
        requestAnimationFrame(() => {
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${Math.round(progress)}%`;
        });
    }
}

function loadData(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                updateProgressBar(progress);
            }
        };
        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = d3.csvParse(xhr.responseText);
                updateProgressBar(100);
                resolve(data);
            } else {
                reject(new Error(`Failed to load CSV: ${xhr.statusText}`));
            }
        };
        xhr.onerror = () => reject(new Error("Network error while loading CSV"));
        xhr.send();
    });
}

export { showLoading, hideLoading, updateLoadingMessage, updateProgressBar, loadData };
