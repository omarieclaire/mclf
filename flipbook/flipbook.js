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

    async function loadPDF() {
        try {
            const loadingTask = pdfjsLib.getDocument(PDF_URL);
            pdfDoc = await loadingTask.promise;
            totalPages = pdfDoc.numPages;
            
            console.log('PDF loaded:', totalPages, 'pages');
            
            await renderAllPages();
            initializeFlipbook();
            
            document.getElementById('loading-message').style.display = 'none';
            document.getElementById('book-wrapper').style.display = 'flex';
            
            // Show mobile tap hints on first load (mobile only)
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    document.getElementById('tap-hint-left').style.animation = 'fadeInOut 3s ease-in-out';
                    document.getElementById('tap-hint-right').style.animation = 'fadeInOut 3s ease-in-out';
                }, 500);
            }
        } catch (error) {
            console.error('Error loading PDF:', error);
            document.getElementById('loading-message').innerHTML = 
                '<div>Unable to load the zine. Please check the PDF file.</div>';
        }
    }

    async function renderAllPages() {
        const flipbook = $('#flipbook');
        
        // Render each page to canvas
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 }); // High quality render
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            const pageDiv = $('<div class="page"></div>');
            pageDiv.append(canvas);
            flipbook.append(pageDiv);
        }
    }

    function initializeFlipbook() {
        const flipbook = $('#flipbook');
        const isMobile = window.innerWidth <= 768;
        
        // Get first canvas to determine dimensions
        const firstCanvas = $('#flipbook canvas').first();
        if (!firstCanvas.length) return;
        
        const canvasWidth = firstCanvas[0].width;
        const canvasHeight = firstCanvas[0].height;
        const aspectRatio = canvasWidth / canvasHeight;
        const isLandscape = aspectRatio > 1;
        
        let bookWidth, bookHeight;
        let displayMode;
        
        if (isMobile) {
            // Mobile: ALWAYS show double page spread for zine reading
            displayMode = 'double';
            const maxWidth = window.innerWidth - 20;
            const maxHeight = window.innerHeight - 20;
            
            // For double page spread, calculate based on two pages side by side
            bookHeight = maxHeight;
            bookWidth = bookHeight * aspectRatio * 2; // Two pages wide
            
            if (bookWidth > maxWidth) {
                bookWidth = maxWidth;
                bookHeight = (bookWidth / 2) / aspectRatio;
            }
        } else {
            // Desktop: show spreads for portrait pages
            if (isLandscape) {
                displayMode = 'single';
            } else {
                displayMode = 'double';
            }
            
            // Simple calculation: window size minus known UI elements
            const horizontalReserved = 20 + 120 + 20; // padding + arrows + gaps = 160px
            const verticalReserved = 20 + 40; // padding + small margin for controls = 60px
            
            const maxWidth = window.innerWidth - horizontalReserved;
            const maxHeight = window.innerHeight - verticalReserved;
            
            if (displayMode === 'single') {
                // Try to maximize height first for single pages
                bookHeight = maxHeight;
                bookWidth = bookHeight * aspectRatio;
                
                // Only reduce if width doesn't fit
                if (bookWidth > maxWidth) {
                    bookWidth = maxWidth;
                    bookHeight = bookWidth / aspectRatio;
                }
            } else {
                // Double page spread - PRIORITIZE HEIGHT
                bookHeight = maxHeight;
                bookWidth = bookHeight * aspectRatio * 2;
                
                // Only reduce if width doesn't fit
                if (bookWidth > maxWidth) {
                    bookWidth = maxWidth;
                    bookHeight = (bookWidth / 2) / aspectRatio;
                }
            }
        }
        
        console.log('Book dimensions:', bookWidth, 'x', bookHeight);
        console.log('Display mode:', displayMode);
        console.log('Available space:', window.innerWidth, 'x', window.innerHeight);
        
        // Initialize Turn.js with MUCH better flip animations
        flipbook.turn({
            width: bookWidth,
            height: bookHeight,
            autoCenter: true,
            gradients: true,
            acceleration: true,
            elevation: 50,
            duration: 800, // Balanced duration
            turnCorners: 'br,bl,tr,tl', // Enable corner turning on all devices
            display: displayMode,
            when: {
                turning: function(event, page, pageObject) {
                    // Add class for single page centering on first/last page
                    if ((page === 1 || page === totalPages) && displayMode === 'double') {
                        $(this).addClass('flipbook-centered');
                    } else {
                        $(this).removeClass('flipbook-centered');
                    }
                },
                turned: function(event, page) {
                    updatePageInfo(page);
                },
                start: function(event, pageObject, corner) {
                    // Enable corner peek preview on hover
                    console.log('Turn started from corner:', corner);
                }
            }
        });

        // Add hover effect for page corner peel preview (DESKTOP ONLY)
        if (!isMobile) {
            flipbook.on('mouseover', function(e) {
                const offset = $(this).offset();
                const mouseX = e.pageX - offset.left;
                const mouseY = e.pageY - offset.top;
                const bookWidth = $(this).width();
                const bookHeight = $(this).height();
                
                // Check if mouse is near a corner (for peek effect)
                const cornerSize = 100;
                
                if (mouseX < cornerSize && mouseY < cornerSize) {
                    // Top left corner - previous page
                    $(this).turn('peel', 'tl');
                } else if (mouseX > bookWidth - cornerSize && mouseY < cornerSize) {
                    // Top right corner - next page
                    $(this).turn('peel', 'tr');
                } else if (mouseX < cornerSize && mouseY > bookHeight - cornerSize) {
                    // Bottom left corner - previous page
                    $(this).turn('peel', 'bl');
                } else if (mouseX > bookWidth - cornerSize && mouseY > bookHeight - cornerSize) {
                    // Bottom right corner - next page
                    $(this).turn('peel', 'br');
                }
            });

            flipbook.on('mouseout', function() {
                // Remove peel effect when mouse leaves
                if (!$(this).turn('animating')) {
                    $(this).turn('peel', false);
                }
            });
        }

        // Simple tap-to-flip for easier mobile navigation
        if (isMobile) {
            flipbook.on('click', function(e) {
                const bookWidth = $(this).width();
                const offset = $(this).offset();
                const relativeX = e.pageX - offset.left;
                
                // Left half = previous, right half = next
                if (relativeX < bookWidth / 2) {
                    $(this).turn('previous');
                } else {
                    $(this).turn('next');
                }
            });
        }
        
        updatePageInfo(1);
    }

    function updatePageInfo(page) {
        const flipbook = $('#flipbook');
        const totalPages = flipbook.turn('pages');
        
        // Update navigation button states
        $('#prev-btn').prop('disabled', page === 1);
        $('#next-btn').prop('disabled', page === totalPages);
        
        console.log('Current page:', page, '/', totalPages);
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
        } else if (e.key === 'Home') {
            e.preventDefault();
            $('#flipbook').turn('page', 1);
        } else if (e.key === 'End') {
            e.preventDefault();
            $('#flipbook').turn('page', $('#flipbook').turn('pages'));
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

    // Fullscreen with landscape orientation hint on mobile
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
            
            // On mobile, try to lock to landscape
            if (window.innerWidth <= 768 && screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {
                    // Orientation lock not supported or failed
                });
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            // Unlock orientation
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
        
        // Re-initialize flipbook on fullscreen change
        setTimeout(() => {
            if ($('#flipbook').turn('is')) {
                handleResize();
            }
        }, 100);
    }

    // Draggable controls
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const controls = document.getElementById('controls');

    controls.addEventListener('mousedown', startDrag);
    controls.addEventListener('touchstart', startDrag);

    function startDrag(e) {
        // Don't drag if clicking on a button
        if (e.target.closest('button')) return;
        
        isDragging = true;
        controls.classList.add('dragging');
        
        const rect = controls.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        dragOffsetX = clientX - rect.left - rect.width / 2;
        dragOffsetY = clientY - rect.top - rect.height / 2;
        
        e.preventDefault();
    }

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);

    function drag(e) {
        if (!isDragging) return;
        
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        const x = clientX - dragOffsetX;
        const y = clientY - dragOffsetY;
        
        controls.style.left = x + 'px';
        controls.style.bottom = 'auto';
        controls.style.top = y + 'px';
        controls.style.transform = 'none';
        
        e.preventDefault();
    }

    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);

    function stopDrag() {
        if (isDragging) {
            isDragging = false;
            controls.classList.remove('dragging');
        }
    }

    // Responsive handling
    function handleResize() {
        if (!$('#flipbook').turn('is')) return;
        
        const isMobile = window.innerWidth <= 768;
        const firstCanvas = $('#flipbook canvas').first();
        if (!firstCanvas.length) return;
        
        const canvasWidth = firstCanvas[0].width;
        const canvasHeight = firstCanvas[0].height;
        const aspectRatio = canvasWidth / canvasHeight;
        const isLandscape = aspectRatio > 1;
        
        let bookWidth, bookHeight;
        let displayMode;
        
        if (isMobile) {
            // Mobile: ALWAYS double page spread
            displayMode = 'double';
            const maxWidth = window.innerWidth - 20;
            const maxHeight = window.innerHeight - 20;
            
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
            
            // Simple calculation: window size minus known UI elements
            const horizontalReserved = 20 + 120 + 20; // padding + arrows + gaps
            const verticalReserved = 20 + 40; // padding + small margin for controls
            
            const maxWidth = window.innerWidth - horizontalReserved;
            const maxHeight = window.innerHeight - verticalReserved;
            
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
    }

    let resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 250);
    });

    // Initialize when DOM is ready
    $(document).ready(function() {
        loadPDF();
    });
})();