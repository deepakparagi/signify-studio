document.addEventListener("DOMContentLoaded", function () {
    // Navigation functionality
    const homeLink = document.getElementById('home-link');
    const createSignatureLink = document.getElementById('create-signature-link');
    const getStartedBtn = document.getElementById('get-started-btn');
    const landingContent = document.getElementById('landing-content');
    const signatureApp = document.getElementById('signature-app');
    
    // Show landing page by default
    landingContent.style.display = 'block';
    signatureApp.style.display = 'none';
    
    // Navigation event listeners
    homeLink.addEventListener('click', function(e) {
        e.preventDefault();
        showLandingPage();
    });
    
    createSignatureLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSignatureApp();
    });
    
    getStartedBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showSignatureApp();
    });
    
    function showLandingPage() {
        landingContent.style.display = 'block';
        signatureApp.style.display = 'none';
        homeLink.classList.add('active');
        createSignatureLink.classList.remove('active');
    }
    
    function showSignatureApp() {
        landingContent.style.display = 'none';
        signatureApp.style.display = 'block';
        homeLink.classList.remove('active');
        createSignatureLink.classList.add('active');
        
        // Animate app container after showing it
        setTimeout(() => {
            document.querySelector('.app-container').style.opacity = '1';
            document.querySelector('.app-container').style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Signature canvas functionality
    const canvas = document.getElementById('signature-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 200;
    // Initialize canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let brushColor = '#000000';
    let brushSize = 5;
    let backgroundColor = '#ffffff';
    
    // Set up event listeners for mouse
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Set up event listeners for touch
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    document.getElementById('text-color').addEventListener('input', changeBrushColor);
    document.getElementById('background-color').addEventListener('input', changeBackgroundColor);
    document.getElementById('brush-size').addEventListener('input', changeBrushSize);
    document.getElementById('clear-btn').addEventListener('click', clearCanvas);
    document.getElementById('save-btn').addEventListener('click', saveSignature);
    document.getElementById('download-btn').addEventListener('click', downloadSignature);
    document.getElementById('retrieve-btn').addEventListener('click', retrieveSignature);
    
    // Display the current brush size
    const sizeValue = document.getElementById('size-value');
    const brushSizeSlider = document.getElementById('brush-size');
    sizeValue.textContent = brushSizeSlider.value;
    brushSizeSlider.addEventListener('input', function() {
        sizeValue.textContent = this.value;
    });
    
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }
    
    function draw(e) {
        if (!isDrawing) return;
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    // Touch event handlers
    function handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            offsetX: touch.clientX - rect.left,
            offsetY: touch.clientY - rect.top
        });
        canvas.dispatchEvent(mouseEvent);
    }
    
    function handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            offsetX: touch.clientX - rect.left,
            offsetY: touch.clientY - rect.top
        });
        canvas.dispatchEvent(mouseEvent);
    }
    
    function handleTouchEnd(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    }
    
    function changeBrushColor() {
        brushColor = this.value;
    }
    
    function changeBackgroundColor() {
        backgroundColor = this.value;
        // Redraw canvas with new background while preserving signature
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
    }
    
    function changeBrushSize() {
        brushSize = parseInt(this.value);
    }
    
    function clearCanvas() {
        if (confirm("Are you sure you want to clear the canvas?")) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    function saveSignature() {
        localStorage.setItem('signature', canvas.toDataURL());
        showNotification('Signature saved successfully!');
        // Update the preview
        const preview = document.querySelector('.signature-preview');
        preview.innerHTML = '';
        const img = document.createElement('img');
        img.src = canvas.toDataURL();
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        preview.appendChild(img);
    }
    
    function downloadSignature() {
        const link = document.createElement('a');
        // Create a temporary canvas to handle background color
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        // Fill with background color
        tempCtx.fillStyle = backgroundColor;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        // Draw the signature on top
        tempCtx.drawImage(canvas, 0, 0);
        // Use temporary canvas for download
        link.href = tempCanvas.toDataURL('image/png');
        link.download = 'signature.png';
        link.click();
        showNotification('Signature downloaded as PNG!');
    }
    
    function retrieveSignature() {
        const savedSignature = localStorage.getItem('signature');
        if (savedSignature) {
            const img = new Image();
            img.src = savedSignature;
            img.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                // Update the preview
                const preview = document.querySelector('.signature-preview');
                preview.innerHTML = '';
                const previewImg = document.createElement('img');
                previewImg.src = savedSignature;
                previewImg.style.maxWidth = '100%';
                previewImg.style.maxHeight = '100%';
                preview.appendChild(previewImg);
            }
            showNotification('Signature retrieved successfully!');
        } else {
            showNotification('No signature saved yet.', true);
        }
    }
    
    function showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.background = isError ? 'var(--danger)' : 'var(--success)';
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});