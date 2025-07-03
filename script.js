 // Initialize PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
        
        // DOM Elements
        const inputText = document.getElementById('inputText');
        const pdfUpload = document.getElementById('pdfUpload');
        const uploadBtn = document.getElementById('uploadBtn');
        const fileName = document.getElementById('fileName');
        const fontFamily = document.getElementById('fontFamily');
        const paperStyle = document.getElementById('paperStyle');
        const inkColor = document.getElementById('inkColor');
        const fontSize = document.getElementById('fontSize');
        const fontSizeValue = document.getElementById('fontSizeValue');
        const lineHeight = document.getElementById('lineHeight');
        const lineHeightValue = document.getElementById('lineHeightValue');
        const generateBtn = document.getElementById('generateBtn');
        const clearBtn = document.getElementById('clearBtn');
        const handwritingText = document.getElementById('handwritingText');
        const handwritingPreview = document.getElementById('handwritingPreview');
        const previewContainer = document.getElementById('previewContainer');
        const pageControls = document.getElementById('pageControls');
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        const pageIndicator = document.getElementById('pageIndicator');
        const downloadPNG = document.getElementById('downloadPNG');
        const downloadPDF = document.getElementById('downloadPDF');
        const downloadAll = document.getElementById('downloadAll');
        const printBtn = document.getElementById('printBtn');
        const backToTop = document.getElementById('backToTop');
        const backToTopLink = document.getElementById('backToTopLink');
        const currentYear = document.getElementById('currentYear');
        const progressBar = document.querySelector('.progress-bar');
        
        // App State
        let currentPage = 1;
        let totalPages = 1;
        let pages = [];
        let pdfText = '';
        
        // Set current year
        currentYear.textContent = new Date().getFullYear();
        
        // Load saved settings from localStorage
        function loadSettings() {
            const savedText = localStorage.getItem('handwritingText');
            if (savedText) {
                inputText.value = savedText;
            }
            
            const savedFont = localStorage.getItem('handwritingFont');
            if (savedFont) {
                fontFamily.value = savedFont;
            }
            
            const savedPaper = localStorage.getItem('paperStyle');
            if (savedPaper) {
                paperStyle.value = savedPaper;
            }
            
            const savedColor = localStorage.getItem('inkColor');
            if (savedColor) {
                inkColor.value = savedColor;
            }
            
            const savedSize = localStorage.getItem('fontSize');
            if (savedSize) {
                fontSize.value = savedSize;
                fontSizeValue.textContent = savedSize;
            }
            
            const savedLineHeight = localStorage.getItem('lineHeight');
            if (savedLineHeight) {
                lineHeight.value = savedLineHeight;
                lineHeightValue.textContent = savedLineHeight;
            }
            
            // Generate preview if there's saved text
            if (savedText) {
                generateHandwriting();
            }
        }
        
        // Save settings to localStorage
        function saveSettings() {
            localStorage.setItem('handwritingText', inputText.value);
            localStorage.setItem('handwritingFont', fontFamily.value);
            localStorage.setItem('paperStyle', paperStyle.value);
            localStorage.setItem('inkColor', inkColor.value);
            localStorage.setItem('fontSize', fontSize.value);
            localStorage.setItem('lineHeight', lineHeight.value);
        }
        
        // Update progress bar
        function updateProgress(progress) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Extract text from PDF
        async function extractTextFromPDF(file) {
            updateProgress(0);
            try {
                const pdfData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(new Uint8Array(reader.result));
                    reader.onerror = reject;
                    reader.readAsArrayBuffer(file);
                });
                
                const pdf = await pdfjsLib.getDocument({data: pdfData}).promise;
                let extractedText = '';
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const textItems = textContent.items.map(item => item.str);
                    extractedText += textItems.join(' ') + '\n\n';
                    updateProgress((i / pdf.numPages) * 100);
                }
                
                return extractedText;
            } catch (error) {
                console.error('Error extracting text from PDF:', error);
                alert('Error extracting text from PDF. Please try another file.');
                return '';
            } finally {
                setTimeout(() => {
                    progressBar.style.width = '0%';
                }, 500);
            }
        }
        
        // Split text into pages
        function splitTextIntoPages(text) {
            // This is a simplified version - in a real app you'd need more complex logic
            // to properly handle page breaks based on font size, line height, paper size, etc.
            const words = text.split(' ');
            const wordsPerPage = 300; // Approximate words per A4 page
            const pages = [];
            let currentPage = '';
            
            for (let i = 0; i < words.length; i++) {
                currentPage += words[i] + ' ';
                
                if ((i + 1) % wordsPerPage === 0 || i === words.length - 1) {
                    pages.push(currentPage.trim());
                    currentPage = '';
                }
            }
            
            return pages;
        }
        
        // Generate handwriting preview
        function generateHandwriting() {
            const text = inputText.value || pdfText;
            if (!text.trim()) {
                alert('Please enter some text first');
                return;
            }
            
            // Split text into pages
            pages = splitTextIntoPages(text);
            totalPages = pages.length;
            currentPage = 1;
            
            // Update UI
            updatePageControls();
            renderCurrentPage();
            saveSettings();
        }
        
        // Render current page
        function renderCurrentPage() {
            if (pages.length === 0) return;
            
            // Update paper style
            handwritingPreview.className = 'handwriting-paper';
            handwritingPreview.classList.add(`${paperStyle.value}-paper`);
            
            // Update text style
            handwritingText.style.fontFamily = fontFamily.value;
            handwritingText.style.fontSize = `${fontSize.value}px`;
            handwritingText.style.lineHeight = lineHeight.value;
            
            // Update ink color
            if (inkColor.value.includes('gradient')) {
                handwritingText.style.background = inkColor.value;
                handwritingText.style.webkitBackgroundClip = 'text';
                handwritingText.style.backgroundClip = 'text';
                handwritingText.style.color = 'transparent';
            } else {
                handwritingText.style.background = '';
                handwritingText.style.webkitBackgroundClip = '';
                handwritingText.style.backgroundClip = '';
                handwritingText.style.color = inkColor.value;
            }
            
            // Set the text
            handwritingText.textContent = pages[currentPage - 1] || 'No content for this page';
        }
        
        // Update page controls
        function updatePageControls() {
            if (totalPages > 1) {
                pageControls.classList.remove('hidden');
                pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
                
                prevPage.disabled = currentPage === 1;
                nextPage.disabled = currentPage === totalPages;
            } else {
                pageControls.classList.add('hidden');
            }
        }
        
        // Download current page as PNG
        async function downloadCurrentPageAsPNG() {
            if (pages.length === 0) {
                alert('Please generate handwriting first');
                return;
            }
            
            try {
                const canvas = await html2canvas(handwritingPreview, {
                    scale: 2,
                    logging: false,
                    useCORS: true,
                    allowTaint: true
                });
                
                const link = document.createElement('a');
                link.download = `handwriting-page-${currentPage}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error('Error generating PNG:', error);
                alert('Error generating PNG. Please try again.');
            }
        }
        
        // Download current page as PDF
        async function downloadCurrentPageAsPDF() {
            if (pages.length === 0) {
                alert('Please generate handwriting first');
                return;
            }
            
            try {
                const canvas = await html2canvas(handwritingPreview, {
                    scale: 2,
                    logging: false,
                    useCORS: true,
                    allowTaint: true
                });
                
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF.jsPDF({
                    orientation: 'portrait',
                    unit: 'mm'
                });
                
                const imgWidth = 210; // A4 width in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save(`handwriting-page-${currentPage}.pdf`);
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('Error generating PDF. Please try again.');
            }
        }
        
        // Download all pages as ZIP
        async function downloadAllPages() {
            if (pages.length === 0) {
                alert('Please generate handwriting first');
                return;
            }
            
            try {
                const zip = new JSZip();
                const imgFolder = zip.folder("handwriting-pages");
                
                // Show loading state
                downloadAll.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Preparing...';
                downloadAll.disabled = true;
                
                // Process each page
                for (let i = 0; i < pages.length; i++) {
                    currentPage = i + 1;
                    renderCurrentPage();
                    
                    // Small delay to ensure DOM updates
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    const canvas = await html2canvas(handwritingPreview, {
                        scale: 2,
                        logging: false,
                        useCORS: true,
                        allowTaint: true
                    });
                    
                    const imgData = canvas.toDataURL('image/png').split(',')[1];
                    imgFolder.file(`page-${i+1}.png`, imgData, {base64: true});
                    
                    // Update progress
                    downloadAll.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Processing page ${i+1}/${pages.length}`;
                }
                
                // Generate ZIP
                const content = await zip.generateAsync({type: "blob"});
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = "handwriting-pages.zip";
                link.click();
                
            } catch (error) {
                console.error('Error generating ZIP:', error);
                alert('Error generating ZIP file. Please try again.');
            } finally {
                // Reset button state
                downloadAll.innerHTML = '<i class="fas fa-file-archive mr-2"></i> All Pages';
                downloadAll.disabled = false;
            }
        }
        
        // Event Listeners
        uploadBtn.addEventListener('click', () => pdfUpload.click());
        
        pdfUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                fileName.textContent = file.name;
                pdfText = await extractTextFromPDF(file);
                inputText.value = pdfText;
            }
        });
        
        fontSize.addEventListener('input', () => {
            fontSizeValue.textContent = fontSize.value;
        });
        
        lineHeight.addEventListener('input', () => {
            lineHeightValue.textContent = lineHeight.value;
        });
        
        generateBtn.addEventListener('click', generateHandwriting);
        
        clearBtn.addEventListener('click', () => {
            inputText.value = '';
            pdfText = '';
            pdfUpload.value = '';
            fileName.textContent = 'No file selected';
            handwritingText.textContent = 'Your generated handwriting will appear here...';
            pages = [];
            totalPages = 1;
            currentPage = 1;
            pageControls.classList.add('hidden');
            localStorage.removeItem('handwritingText');
        });
        
        prevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCurrentPage();
                updatePageControls();
            }
        });
        
        nextPage.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderCurrentPage();
                updatePageControls();
            }
        });
        
        downloadPNG.addEventListener('click', downloadCurrentPageAsPNG);
        downloadPDF.addEventListener('click', downloadCurrentPageAsPDF);
        downloadAll.addEventListener('click', downloadAllPages);
        
        printBtn.addEventListener('click', () => {
            window.print();
        });
        
        // Back to top button
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
        
        backToTopLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
        
        // Initialize app
        loadSettings();
        
        // Register service worker for PWA
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(err => {
                        console.log('ServiceWorker registration failed: ', err);
                    });
            });
        }
