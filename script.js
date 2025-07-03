const config = {
      font: 'font-handwriting-neat',
      fontSize: 22,
      lineHeight: 1.5,
      paperStyle: 'paper-ruled',
      inkColor: '#000000'
    };

    const elements = {
      textInput: document.getElementById('text-input'),
      previewText: document.getElementById('preview-text'),
      previewContainer: document.getElementById('handwriting-preview').parentElement,
      fontSelect: document.getElementById('font-select'),
      paperSelect: document.getElementById('paper-select'),
      colorSelect: document.getElementById('color-select'),
      fontSizeSlider: document.getElementById('font-size'),
      fontSizeValue: document.getElementById('font-size-value'),
      lineHeightSlider: document.getElementById('line-height'),
      lineHeightValue: document.getElementById('line-height-value'),
      downloadButton: document.getElementById('download-button'),
      downloadPdfButton: document.getElementById('download-pdf-button'),
      downloadAllButton: document.getElementById('download-all-button'),
      downloadAllPdfButton: document.getElementById('download-all-pdf-button'),
      pagination: document.getElementById('pagination'),
      paginationContent: document.getElementById('pagination-content'),
      fileInput: document.getElementById('file-input'),
      fileUploadArea: document.getElementById('file-upload-area'),
      fileInfo: document.getElementById('file-info'),
      fileName: document.getElementById('file-name'),
      pdfProgress: document.getElementById('pdf-progress'),
      progressFill: document.getElementById('progress-fill')
    };

    let pages = [''];
    let currentPage = 0;

    // Event Listeners
    elements.textInput.addEventListener('input', updateText);
    elements.fontSelect.addEventListener('change', updateFont);
    elements.paperSelect.addEventListener('change', updatePaper);
    elements.colorSelect.addEventListener('change', updateColor);
    elements.fontSizeSlider.addEventListener('input', updateFontSize);
    elements.lineHeightSlider.addEventListener('input', updateLineHeight);
    elements.downloadButton.addEventListener('click', downloadCurrentPage);
    elements.downloadPdfButton.addEventListener('click', downloadCurrentPageAsPdf);
    elements.downloadAllButton.addEventListener('click', downloadAllPages);
    elements.downloadAllPdfButton.addEventListener('click', downloadAllPagesAsPdf);
    elements.fileInput.addEventListener('change', handleFileUpload);
    
    // File upload drag and drop
    elements.fileUploadArea.addEventListener('dragover', handleDragOver);
    elements.fileUploadArea.addEventListener('dragleave', handleDragLeave);
    elements.fileUploadArea.addEventListener('drop', handleFileDrop);

    // Core Functions
    function updateText() {
      const text = elements.textInput.value.trim();
      
      if (!text) {
        pages = [''];
        currentPage = 0;
        toggleUI(false);
        renderPage();
        return;
      }
      
      pages = splitTextIntoPages(text);
      currentPage = 0;
      toggleUI(pages.length > 1);
      renderPage();
      animatePreviewText();
    }

    function splitTextIntoPages(text) {
      const textPages = [];
      let remainingText = text;
      
      while (remainingText.length > 0) {
        const breakPoint = findOptimalBreakPoint(remainingText, getCharsPerPage());
        textPages.push(remainingText.substring(0, breakPoint).trim());
        remainingText = remainingText.substring(breakPoint).trim();
      }
      
      return textPages.length > 0 ? textPages : [''];
    }

    function findOptimalBreakPoint(text, maxLength) {
      if (text.length <= maxLength) return text.length;
      const breakPoints = [
        text.lastIndexOf('\n\n', maxLength),
        Math.max(
          text.lastIndexOf('. ', maxLength),
          text.lastIndexOf('! ', maxLength),
          text.lastIndexOf('? ', maxLength)
        ),
        Math.max(
          text.lastIndexOf(', ', maxLength),
          text.lastIndexOf('; ', maxLength),
          text.lastIndexOf(': ', maxLength)
        ),
        text.lastIndexOf(' ', maxLength)
      ];
      
      for (const bp of breakPoints) {
        if (bp > maxLength * 0.6) return bp + 2;
      }
      
      return maxLength;
    }

    function getCharsPerPage() {
      const printableWidth = 160;
      const printableHeight = 247;
      const avgCharWidth = config.fontSize * 0.55 / 3.78;
      const lineHeight = config.fontSize * config.lineHeight / 3.78;
      return Math.floor((printableWidth / avgCharWidth) * (printableHeight / lineHeight) * 0.9);
    }

    function renderPagination() {
      elements.paginationContent.innerHTML = '';
      
      // Pagination buttons creation
      const buttons = [
        createPaginationButton('&lt;', currentPage === 0, () => navigatePage(currentPage - 1)),
        ...pages.map((_, i) => createPaginationButton(i + 1, i === currentPage, () => navigatePage(i))),
        createPaginationButton('&gt;', currentPage === pages.length - 1, () => navigatePage(currentPage + 1))
      ];
      
      buttons.forEach(button => elements.paginationContent.appendChild(button));
    }

    function createPaginationButton(content, disabled, onClick) {
      const button = document.createElement('button');
      button.className = `pagination-button ${disabled ? 'disabled' : ''}`;
      button.innerHTML = content;
      button.disabled = disabled;
      button.addEventListener('click', onClick);
      return button;
    }

    function navigatePage(page) {
      if (page >= 0 && page < pages.length) {
        currentPage = page;
        renderPage();
        renderPagination();
      }
    }

    function renderPage() {
      elements.previewText.textContent = pages[currentPage] || 'Your realistic handwritten text will appear here';
    }

    // Style Updates
    function updateFont() {
      config.font = elements.fontSelect.value;
      elements.previewText.className = config.font;
    }

    function updatePaper() {
      config.paperStyle = elements.paperSelect.value;
      document.getElementById('handwriting-preview').className = `preview-area ${config.paperStyle}`;
    }

    function updateColor() {
      config.inkColor = elements.colorSelect.value;
      elements.previewText.style.color = config.inkColor;
    }

    function updateFontSize() {
      config.fontSize = parseInt(elements.fontSizeSlider.value);
      elements.fontSizeValue.textContent = config.fontSize;
      elements.previewText.style.fontSize = `${config.fontSize}px`;
      if (elements.textInput.value) updateText();
    }

    function updateLineHeight() {
      config.lineHeight = parseFloat(elements.lineHeightSlider.value);
      elements.lineHeightValue.textContent = config.lineHeight;
      elements.previewText.style.lineHeight = config.lineHeight;
      if (elements.textInput.value) updateText();
    }

    // Download Functions
    function downloadCurrentPage() {
      showDownloadLoading(elements.downloadButton);
      html2canvas(elements.previewContainer, {
        scale: 2,
        logging: false,
        useCORS: true,
        letterRendering: true
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `handwritten-page-${currentPage + 1}.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    }

    function downloadCurrentPageAsPdf() {
      showDownloadLoading(elements.downloadPdfButton);
      html2canvas(elements.previewContainer, {
        scale: 2,
        logging: false,
        useCORS: true,
        letterRendering: true
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `handwritten-page-${currentPage + 1}.pdf`;
        link.href = canvas.toDataURL('application/pdf');
        link.click();
      });
    }

    function downloadAllPages() {
      showDownloadLoading(elements.downloadAllButton);
      const zip = new JSZip();
      const originalPage = currentPage;
      
      Promise.all(pages.map((_, i) => new Promise(resolve => {
        navigatePage(i);
        setTimeout(() => {
          html2canvas(elements.previewContainer, {
            scale: 2,
            logging: false,
            useCORS: true,
            letterRendering: true
          }).then(canvas => {
            canvas.toBlob(blob => {
              zip.file(`page-${i + 1}.png`, blob);
              resolve();
            });
          });
        }, 500);
      }))).then(() => {
        zip.generateAsync({ type: 'blob' }).then(content => {
          const link = document.createElement('a');
          link.download = 'handwritten-pages.zip';
          link.href = URL.createObjectURL(content);
          link.click();
          navigatePage(originalPage);
        });
      });
    }

    function downloadAllPagesAsPdf() {
      showDownloadLoading(elements.downloadAllPdfButton);
      const zip = new JSZip();
      const originalPage = currentPage;
      
      Promise.all(pages.map((_, i) => new Promise(resolve => {
        navigatePage(i);
        setTimeout(() => {
          html2canvas(elements.previewContainer, {
            scale: 2,
            logging: false,
            useCORS: true,
            letterRendering: true
          }).then(canvas => {
            canvas.toBlob(blob => {
              zip.file(`page-${i + 1}.pdf`, blob);
              resolve();
            });
          });
        }, 500);
      }))).then(() => {
        zip.generateAsync({ type: 'blob' }).then(content => {
          const link = document.createElement('a');
          link.download = 'handwritten-pages.zip';
          link.href = URL.createObjectURL(content);
          link.click();
          navigatePage(originalPage);
        });
      });
    }

    // UI Helpers
    function toggleUI(multiPage) {
      elements.downloadButton.disabled = false;
      elements.downloadPdfButton.disabled = false;
      elements.downloadAllButton.style.display = multiPage ? 'block' : 'none';
      elements.downloadAllButton.disabled = !multiPage;
      elements.downloadAllPdfButton.style.display = multiPage ? 'block' : 'none';
      elements.downloadAllPdfButton.disabled = !multiPage;
      elements.pagination.style.display = multiPage ? 'flex' : 'none';
    }

    function animatePreviewText() {
      elements.previewText.classList.add('preview-text-animation');
      setTimeout(() => elements.previewText.classList.remove('preview-text-animation'), 1200);
    }

    function showDownloadLoading(button) {
      button.classList.add('download-loading');
      setTimeout(() => button.classList.remove('download-loading'), 2000);
    }

    // Footer Functions
    function scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    function showPrivacyInfo() {
      alert('Privacy Policy:\n\nThis application processes all text locally in your browser. No data is sent to external servers or stored anywhere. Your privacy is completely protected.\n\nAll handwriting conversion happens on your device using client-side JavaScript.');
    }

    function showFeedback() {
      const feedback = prompt('Please share your feedback or suggestions for improvement:');
      if (feedback) {
        alert('Thank you for your feedback! I appreciate your input to make this tool better.');
      }
    }

    // Initialize current year
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Initialization
    function initialize() {
      // Load JSZip
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js';
      document.head.appendChild(script);

      // Set initial styles
      updateFont();
      updatePaper();
      updateColor();
      updateFontSize();
      updateLineHeight();

      // Card animations
      document.querySelectorAll('.card').forEach((card, i) => {
        card.style.animationDelay = `${i * 0.1}s`;
      });

      // 3D Preview Effect
      elements.previewContainer.addEventListener('mousemove', (e) => {
        const rect = elements.previewContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        elements.previewContainer.style.transform = `
          perspective(1000px)
          rotateX(${(y - rect.height/2) / 15}deg)
          rotateY(${-(x - rect.width/2) / 15}deg)
        `;
      });

      elements.previewContainer.addEventListener('mouseleave', () => {
        elements.previewContainer.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      });
    }

    window.addEventListener('load', initialize);

    // File Upload Functions
    function handleFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.type === 'application/pdf') {
        processPdfFile(file);
      } else {
        alert('Please select a valid PDF file.');
      }
    }

    function handleDragOver(event) {
      event.preventDefault();
      elements.fileUploadArea.classList.add('dragover');
    }

    function handleDragLeave(event) {
      event.preventDefault();
      elements.fileUploadArea.classList.remove('dragover');
    }

    function handleFileDrop(event) {
      event.preventDefault();
      elements.fileUploadArea.classList.remove('dragover');
      
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf') {
          elements.fileInput.files = files;
          processPdfFile(file);
        } else {
          alert('Please drop a valid PDF file.');
        }
      }
    }

    async function processPdfFile(file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.');
        return;
      }

      // Show file info
      elements.fileName.textContent = file.name;
      elements.fileInfo.classList.add('show');
      elements.pdfProgress.classList.add('show');

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        const totalPages = pdf.numPages;
        
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          // Update progress
          const progress = (pageNum / totalPages) * 100;
          elements.progressFill.style.width = progress + '%';
          
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n\n';
        }

        // Set the extracted text
        elements.textInput.value = fullText.trim();
        updateText();
        
        // Hide progress
        elements.pdfProgress.classList.remove('show');
        elements.progressFill.style.width = '0%';
        
      } catch (error) {
        console.error('Error processing PDF:', error);
        alert('Error processing PDF file. Please try again.');
        elements.pdfProgress.classList.remove('show');
        elements.progressFill.style.width = '0%';
      }
    }