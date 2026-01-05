(function() {
    'use strict';

    // Check if PDF_URL is defined
    if (typeof PDF_URL === 'undefined') {
        console.error('PDF_URL must be defined before loading flipbook.js');
        document.getElementById('loading-message').innerHTML = 
            '<div>Configuration error: PDF file not specified.</div>';
        return;
    }

    // PDF.js worker setup
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // Configuration
    let currentZoom = 1;
    const minZoom = 0.5;
    const maxZoom = 2.5;
    const zoomStep = 0.25;
    let isFullscreen = false;
    let pdfDoc = null;
    let totalPages = 0;
    const RENDER_SCALE = 2.0; // High quality rendering
    const renderedPages = new Set();
    const renderingPages = new Set();
    
    // UI visibility
    let uiHideTimeout = null;
    const UI_HIDE_DELAY = 2000; // Hide UI after 2 seconds of no mouse movement
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    async function loadPDF() {
        try {
            const loadingMessage = document.getElementById('loading-message');
            
            const loadingTask = pdfjsLib.getDocument({
                url: PDF_URL,
                onProgress: function(progress) {
                    if (progress.total) {
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        const loaded = (progress.loaded / (1024 * 1024)).toFixed(1);
                        const total = (progress.total / (1024 * 1024)).toFixed(1);
                        
                        loadingMessage.innerHTML = `
                            <div style="margin-bottom: 16px;">Loading PDF...</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                                ${loaded} MB / ${total} MB (${percent}%)
                            </div>
                            <div class="loading-bar">
                                <div style="width: ${percent}%; height: 100%; background: var(--button-primary); border-radius: 4px; transition: width 0.3s ease;"></div>
                            </div>
                        `;
                    }
                }
            });
            
            pdfDoc = await loadingTask.promise;
            totalPages = pdfDoc.numPages;
            
            console.log('PDF loaded:', totalPages, 'pages');
            
            loadingMessage.innerHTML = '<div>Preparing flipbook...</div>';
            
            await initializeFlipbook();
            
            loadingMessage.style.display = 'none';
            document.getElementById('book-wrapper').style.display = 'flex';
                       
        } catch (error) {
            console.error('Error loading PDF:', error);
            document.getElementById('loading-message').innerHTML = 
                '<div style="color: #d32f2f;">Unable to load the zine. Please check the PDF file.</div>' +
                '<div style="font-size: 14px; margin-top: 8px; color: #666;">Error: ' + error.message + '</div>';
        }
    }

    async function renderPage(pageNum) {
        if (renderedPages.has(pageNum) || renderingPages.has(pageNum)) {
            return;
        }
        
        renderingPages.add(pageNum);
        
        try {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: RENDER_SCALE });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            const pageDiv = $(`.page[data-page="${pageNum}"]`);
            if (pageDiv.length) {
                pageDiv.empty().append(canvas);
                renderedPages.add(pageNum);
                console.log('Rendered page', pageNum);
            }
            
        } catch (error) {
            console.error('Error rendering page', pageNum, ':', error);
        } finally {
            renderingPages.delete(pageNum);
        }
    }

    async function renderVisiblePages(currentPage, displayMode) {
        let pagesToRender = [];
        
        if (displayMode === 'single') {
            pagesToRender = [
                currentPage - 1,
                currentPage,
                currentPage + 1,
                currentPage + 2
            ];
        } else {
            const isOdd = currentPage % 2 === 1;
            
            if (isOdd) {
                pagesToRender = [
                    currentPage - 2,
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    currentPage + 2,
                    currentPage + 3
                ];
            } else {
                pagesToRender = [
                    currentPage - 3,
                    currentPage - 2,
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    currentPage + 2
                ];
            }
        }
        
        pagesToRender = pagesToRender.filter(p => p >= 1 && p <= totalPages);
        
        const currentIndex = pagesToRender.indexOf(currentPage);
        if (currentIndex !== -1) {
            const reordered = [currentPage];
            for (let i = 1; i < pagesToRender.length; i++) {
                const leftIdx = currentIndex - i;
                const rightIdx = currentIndex + i;
                if (rightIdx < pagesToRender.length) reordered.push(pagesToRender[rightIdx]);
                if (leftIdx >= 0) reordered.push(pagesToRender[leftIdx]);
            }
            pagesToRender = reordered;
        }
        
        for (const pageNum of pagesToRender) {
            await renderPage(pageNum);
        }
        
        cleanupDistantPages(currentPage, displayMode);
    }

    function cleanupDistantPages(currentPage, displayMode) {
        const keepDistance = displayMode === 'single' ? 5 : 8;
        
        renderedPages.forEach(pageNum => {
            if (Math.abs(pageNum - currentPage) > keepDistance) {
                const pageDiv = $(`.page[data-page="${pageNum}"]`);
                const canvas = pageDiv.find('canvas');
                
                if (canvas.length) {
                    pageDiv.html('<div class="page-placeholder"></div>');
                    renderedPages.delete(pageNum);
                    console.log('Cleaned up page', pageNum);
                }
            }
        });
    }

    async function initializeFlipbook() {
        const flipbook = $('#flipbook');
        const isMobileDevice = window.innerWidth <= 768;
        
        const firstPage = await pdfDoc.getPage(1);
        const firstViewport = firstPage.getViewport({ scale: RENDER_SCALE });
        
        const canvasWidth = firstViewport.width;
        const canvasHeight = firstViewport.height;
        const aspectRatio = canvasWidth / canvasHeight;
        const isLandscape = aspectRatio > 1;
        
        let bookWidth, bookHeight;
        let displayMode;
        
        if (isMobileDevice) {
            displayMode = 'double';
            const maxWidth = window.innerWidth;
            const maxHeight = window.innerHeight - 60; // Leave space for page counter
            
            bookHeight = maxHeight;
            bookWidth = bookHeight * aspectRatio * 2;
            
            if (bookWidth > maxWidth) {
                bookWidth = maxWidth;
                bookHeight = (bookWidth / 2) / aspectRatio;
            }
        } else {
            if (isLandscape) {
                displayMode = 'single';
            } else {
                displayMode = 'double';
            }
            
            // MAXIMIZE: Use almost all viewport space
            const maxWidth = window.innerWidth - 40;
            const maxHeight = window.innerHeight - 40;
            
            if (displayMode === 'single') {
                bookHeight = maxHeight;
                bookWidth = bookHeight * aspectRatio;
                
                if (bookWidth > maxWidth) {
                    bookWidth = maxWidth;
                    bookHeight = bookWidth / aspectRatio;
                }
            } else {
                bookHeight = maxHeight;
                bookWidth = bookHeight * aspectRatio * 2;
                
                if (bookWidth > maxWidth) {
                    bookWidth = maxWidth;
                    bookHeight = (bookWidth / 2) / aspectRatio;
                }
            }
        }
        
        console.log('Book dimensions:', bookWidth, 'x', bookHeight);
        console.log('Display mode:', displayMode);
        
        for (let i = 1; i <= totalPages; i++) {
            const pageDiv = $('<div class="page" data-page="' + i + '"></div>');
            pageDiv.html('<div class="page-placeholder">Page ' + i + '</div>');
            flipbook.append(pageDiv);
        }
        
        await renderVisiblePages(1, displayMode);
        
        flipbook.turn({
            width: bookWidth,
            height: bookHeight,
            autoCenter: true,
            gradients: true,
            acceleration: true,
            elevation: 50,
            duration: 800,
            turnCorners: 'br,bl,tr,tl',
            display: displayMode,
            when: {
                turning: function(event, page, pageObject) {
                    const currentDisplayMode = $(this).turn('display');
                    renderVisiblePages(page, currentDisplayMode);
                    
                    if ((page === 1 || page === totalPages) && currentDisplayMode === 'double') {
                        $(this).addClass('flipbook-centered');
                    } else {
                        $(this).removeClass('flipbook-centered');
                    }
                },
                turned: function(event, page) {
                    updatePageInfo(page);
                    
                    const currentDisplayMode = $(this).turn('display');
                    renderVisiblePages(page, currentDisplayMode);
                },
                start: function(event, pageObject, corner) {
                    console.log('Turn started from corner:', corner);
                }
            }
        });

        if (!isMobileDevice) {
            flipbook.on('mouseover', function(e) {
                const offset = $(this).offset();
                const mouseX = e.pageX - offset.left;
                const mouseY = e.pageY - offset.top;
                const bookWidth = $(this).width();
                const bookHeight = $(this).height();
                
                const cornerSize = 100;
                
                if (mouseX < cornerSize && mouseY < cornerSize) {
                    $(this).turn('peel', 'tl');
                } else if (mouseX > bookWidth - cornerSize && mouseY < cornerSize) {
                    $(this).turn('peel', 'tr');
                } else if (mouseX < cornerSize && mouseY > bookHeight - cornerSize) {
                    $(this).turn('peel', 'bl');
                } else if (mouseX > bookWidth - cornerSize && mouseY > bookHeight - cornerSize) {
                    $(this).turn('peel', 'br');
                }
            });

            flipbook.on('mouseout', function() {
                if (!$(this).turn('animating')) {
                    $(this).turn('peel', false);
                }
            });
        }

        if (isMobileDevice) {
            flipbook.on('click', function(e) {
                const bookWidth = $(this).width();
                const offset = $(this).offset();
                const relativeX = e.pageX - offset.left;
                
                if (relativeX < bookWidth / 2) {
                    $(this).turn('previous');
                } else {
                    $(this).turn('next');
                }
            });
            
            // Add swipe support for mobile
            let touchStartX = 0;
            let touchStartY = 0;
            
            flipbook.on('touchstart', function(e) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            });
            
            flipbook.on('touchend', function(e) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                
                const deltaX = touchEndX - touchStartX;
                const deltaY = touchEndY - touchStartY;
                
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                    if (deltaX > 0) {
                        $(this).turn('previous');
                    } else {
                        $(this).turn('next');
                    }
                }
            });
        }
        
        updatePageInfo(1);
        
        // Setup UI auto-hide for desktop
        if (!isMobile) {
            setupUIAutoHide();
        }
        
        // Setup info panel toggle
        setupInfoPanel();
    }

    function updatePageInfo(page) {
        const flipbook = $('#flipbook');
        const totalPages = flipbook.turn('pages');
        
        $('#prev-btn').prop('disabled', page === 1);
        $('#next-btn').prop('disabled', page === totalPages);
        
        // Update page counter
        const displayMode = flipbook.turn('display');
        let pageText = '';
        
        if (displayMode === 'double' && page !== 1 && page !== totalPages) {
            const leftPage = page % 2 === 0 ? page - 1 : page;
            const rightPage = leftPage + 1;
            pageText = `${leftPage}-${rightPage} / ${totalPages}`;
        } else {
            pageText = `${page} / ${totalPages}`;
        }
        
        $('#page-counter').text(pageText);
        
        console.log('Current page:', page, '/', totalPages);
    }

    // Info panel toggle
    function setupInfoPanel() {
        const infoBtn = $('#info-btn');
        const infoPanel = $('#info-panel');
        let infoPanelVisible = false;
        
        if (isMobile) {
            // Mobile: tap to toggle
            infoBtn.on('click', function(e) {
                e.stopPropagation();
                infoPanelVisible = !infoPanelVisible;
                if (infoPanelVisible) {
                    infoPanel.addClass('visible');
                } else {
                    infoPanel.removeClass('visible');
                }
            });
            
            // Close when tapping outside
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.top-right-controls').length) {
                    infoPanelVisible = false;
                    infoPanel.removeClass('visible');
                }
            });
        } else {
            // Desktop: hover to show
            infoBtn.on('mouseenter', function() {
                infoPanel.addClass('visible');
            });
            
            $('.top-right-controls').on('mouseleave', function() {
                infoPanel.removeClass('visible');
            });
        }
    }

    // UI Auto-hide functionality (desktop only)
    function setupUIAutoHide() {
        const arrows = $('.nav-arrow');
        
        // Show UI immediately on first load
        showUI();
        
        // Hide after delay
        startUIHideTimer();
        
        // Show UI on mouse movement
        $(document).on('mousemove', function() {
            showUI();
            startUIHideTimer();
        });
    }

    function showUI() {
        $('.nav-arrow').addClass('visible');
    }

    function hideUI() {
        $('.nav-arrow').removeClass('visible');
    }

    function startUIHideTimer() {
        clearTimeout(uiHideTimeout);
        uiHideTimeout = setTimeout(hideUI, UI_HIDE_DELAY);
    }

    // Navigation buttons
    $('#prev-btn').on('click', function() {
        $('#flipbook').turn('previous');
    });

    $('#next-btn').on('click', function() {
        $('#flipbook').turn('next');
    });

    // Keyboard navigation
    $(document).on('keydown', function(e) {
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            e.preventDefault();
            $('#flipbook').turn('previous');
        } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
            e.preventDefault();
            $('#flipbook').turn('next');
        }
    });

    // Zoom functionality
    function updateZoom() {
        const bookWrapper = document.getElementById('book-wrapper');
        bookWrapper.style.transform = `scale(${currentZoom})`;
        document.getElementById('zoom-level').textContent = Math.round(currentZoom * 100) + '%';
    }

    $('#zoom-in').on('click', function() {
        if (currentZoom < maxZoom) {
            currentZoom = Math.min(currentZoom + zoomStep, maxZoom);
            updateZoom();
        }
    });

    $('#zoom-out').on('click', function() {
        if (currentZoom > minZoom) {
            currentZoom = Math.max(currentZoom - zoomStep, minZoom);
            updateZoom();
        }
    });

    $('#zoom-reset').on('click', function() {
        currentZoom = 1;
        updateZoom();
    });

    // Fullscreen
    $('#fullscreen-btn').on('click', function() {
        const container = document.getElementById('main-container');
        
        if (!isFullscreen) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
            
            if (window.innerWidth <= 768 && screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {});
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }
        }
    });

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    function handleFullscreenChange() {
        isFullscreen = !!(document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.msFullscreenElement);
        
        const icon = document.getElementById('fullscreen-icon');
        icon.textContent = isFullscreen ? '⛶' : '⛶';
        
        setTimeout(() => {
            if ($('#flipbook').turn('is')) {
                handleResize();
            }
        }, 100);
    }

    // Responsive handling
    function handleResize() {
        if (!$('#flipbook').turn('is')) return;
        
        const isMobileDevice = window.innerWidth <= 768;
        
        const firstCanvas = $('#flipbook canvas').first();
        if (!firstCanvas.length) {
            if (!pdfDoc) return;
            
            pdfDoc.getPage(1).then(page => {
                const viewport = page.getViewport({ scale: RENDER_SCALE });
                const canvasWidth = viewport.width;
                const canvasHeight = viewport.height;
                resizeFlipbook(canvasWidth, canvasHeight, isMobileDevice);
            });
            return;
        }
        
        const canvasWidth = firstCanvas[0].width;
        const canvasHeight = firstCanvas[0].height;
        resizeFlipbook(canvasWidth, canvasHeight, isMobileDevice);
    }

    function resizeFlipbook(canvasWidth, canvasHeight, isMobileDevice) {
        const aspectRatio = canvasWidth / canvasHeight;
        const isLandscape = aspectRatio > 1;
        
        let bookWidth, bookHeight;
        let displayMode;
        
        if (isMobileDevice) {
            displayMode = 'double';
            const maxWidth = window.innerWidth;
            const maxHeight = window.innerHeight - 60;
            
            bookHeight = maxHeight;
            bookWidth = bookHeight * aspectRatio * 2;
            
            if (bookWidth > maxWidth) {
                bookWidth = maxWidth;
                bookHeight = (bookWidth / 2) / aspectRatio;
            }
        } else {
            if (isLandscape) {
                displayMode = 'single';
            } else {
                displayMode = 'double';
            }
            
            // In fullscreen, use even more space
            const padding = isFullscreen ? 20 : 40;
            const maxWidth = window.innerWidth - padding;
            const maxHeight = window.innerHeight - padding;
            
            if (displayMode === 'single') {
                bookHeight = maxHeight;
                bookWidth = bookHeight * aspectRatio;
                
                if (bookWidth > maxWidth) {
                    bookWidth = maxWidth;
                    bookHeight = bookWidth / aspectRatio;
                }
            } else {
                bookHeight = maxHeight;
                bookWidth = bookHeight * aspectRatio * 2;
                
                if (bookWidth > maxWidth) {
                    bookWidth = maxWidth;
                    bookHeight = (bookWidth / 2) / aspectRatio;
                }
            }
        }
        
        console.log('Resized book dimensions:', bookWidth, 'x', bookHeight);
        
        $('#flipbook').turn('size', bookWidth, bookHeight);
        $('#flipbook').turn('display', displayMode);
        
        const currentPage = $('#flipbook').turn('page');
        renderVisiblePages(currentPage, displayMode);
    }

    let resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 250);
    });

    $(document).ready(function() {
        loadPDF();
    });
})();