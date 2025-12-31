/**
 * UI Management for Phase-Aware Components
 * Handles rendering of navigation, CTAs, and status messages based on current phase
 */

class UIManager {
    constructor(phaseManager) {
        this.phaseManager = phaseManager;
        this.config = null;
        this.basePath = this.calculateBasePath();
    }

    /**
     * Calculate the base path based on current page depth in directory structure
     * Returns appropriate relative path prefix (e.g., './', '../', '../../')
     */
    calculateBasePath() {
        const fullPath = window.location.pathname;
        let relativePath;
        
        if (window.location.protocol === 'file:') {
            // For file://, find 'docs/' and get everything after it
            const parts = fullPath.split('/docs/');
            relativePath = parts.length > 1 ? parts[1] : fullPath;
        } else {
            // For http(s)://, remove leading /
            relativePath = fullPath.slice(1);
        }
        
        // Calculate depth from relative path
        const depth = relativePath.split('/').filter(part => part && !part.endsWith('.html')).length;
        return depth > 0 ? '../'.repeat(depth) : './';
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.render());
        } else {
            this.render();
        }
    }

    render() {
        this.config = this.phaseManager.getPhaseConfig();
        
        this.renderStatusBanner();
        this.renderNavigation();
        this.updatePrimaryCTA();
        this.renderSecondaryActions();
    }

    renderStatusBanner() {
        const statusMessage = this.phaseManager.getStatusMessage();
        if (!statusMessage) return;

        // Check if banner was previously dismissed
        const dismissedKey = `status-banner-dismissed-${this.config.phase}-${this.config.awardsYear}`;
        if (statusMessage.dismissible && localStorage.getItem(dismissedKey)) {
            return;
        }

        const existingBanner = document.querySelector('.status-banner');
        if (existingBanner) {
            existingBanner.remove();
        }

        const banner = document.createElement('div');
        banner.className = `status-banner ${statusMessage.type}`;
        banner.innerHTML = `
            <div class="status-banner-content">
                <span>${statusMessage.icon}</span>
                <span>${statusMessage.message}</span>
            </div>
            ${statusMessage.dismissible ? '<button class="status-banner-dismiss" aria-label="Dismiss banner">&times;</button>' : ''}
        `;

        // Insert at the top of the page
        document.body.insertBefore(banner, document.body.firstChild);

        // Handle dismiss
        if (statusMessage.dismissible) {
            const dismissBtn = banner.querySelector('.status-banner-dismiss');
            dismissBtn.addEventListener('click', () => {
                banner.remove();
                localStorage.setItem(dismissedKey, 'true');
            });
        }
    }

    renderNavigation() {
        if (!this.config.showNavigation) return;

        const existingNav = document.querySelector('.phase-nav');
        if (existingNav) {
            existingNav.remove();
        }

        const nav = document.createElement('nav');
        nav.className = 'phase-nav';
        nav.setAttribute('aria-label', 'Phase navigation');

        const breadcrumbList = document.createElement('ul');
        breadcrumbList.className = 'nav-breadcrumb';

        // Add home link
        const homeItem = document.createElement('li');
        if (this.isCurrentPage('index.html')) {
            homeItem.className = 'current';
            homeItem.textContent = 'Home';
            homeItem.setAttribute('aria-current', 'page');
        } else {
            const homeLink = document.createElement('a');
            homeLink.href = this.basePath + 'index.html';
            homeLink.textContent = 'Home';
            homeItem.appendChild(homeLink);
        }
        breadcrumbList.appendChild(homeItem);

        // Add phase-specific navigation items
        this.config.navigation.forEach(item => {
            const listItem = document.createElement('li');
            
            if (this.isCurrentPage(item.href)) {
                listItem.className = 'current';
                listItem.textContent = item.text;
                listItem.setAttribute('aria-current', 'page');
            } else {
                const link = document.createElement('a');
                link.href = this.basePath + item.href;
                link.textContent = item.text;
                
                if (item.highlight) {
                    link.classList.add('highlight');
                }
                
                listItem.appendChild(link);
            }
            
            breadcrumbList.appendChild(listItem);
        });

        nav.appendChild(breadcrumbList);

        // Insert after header
        const header = document.querySelector('header');
        if (header) {
            header.insertAdjacentElement('afterend', nav);
        } else {
            document.body.insertBefore(nav, document.body.firstChild);
        }
    }

    updatePrimaryCTA() {
        const button = document.getElementById('nominees-button');
        if (!button) return;

        const cta = this.config.primaryCTA;
        const buttonText = button.querySelector('.button-text');
        const buttonSubtext = button.querySelector('.button-subtext');

        if (buttonText) buttonText.textContent = cta.text;
        if (buttonSubtext) buttonSubtext.textContent = cta.subtext;

        // Update click handler with base path
        button.onclick = () => window.location.href = this.basePath + cta.href;

        // Add highlight class if needed
        if (cta.highlight) {
            button.classList.add('highlight-cta');
        } else {
            button.classList.remove('highlight-cta');
        }
    }

    renderSecondaryActions() {
        const existingActions = document.querySelector('.secondary-actions');
        if (existingActions) {
            existingActions.remove();
        }

        if (this.config.secondaryActions.length === 0) return;

        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'secondary-actions';

        this.config.secondaryActions.forEach(action => {
            const link = document.createElement('a');
            link.href = this.basePath + action.href;
            link.className = 'secondary-cta';
            link.textContent = action.text;
            actionsContainer.appendChild(link);
        });

        // Insert after primary CTA (home page only)
        const primaryCTA = document.getElementById('nominees-cta-container');
        if (primaryCTA) {
            primaryCTA.insertAdjacentElement('afterend', actionsContainer);
        }
    }

    isCurrentPage(href) {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop() || 'index.html';
        const targetFile = href.split('/').pop();
        
        return currentFile === targetFile || 
               (currentFile === '' && targetFile === 'index.html') ||
               (currentFile === 'index.html' && targetFile === '');
    }
}

// Auto-initialize when phase management is available
document.addEventListener('DOMContentLoaded', function() {
    if (typeof phaseManager !== 'undefined') {
        const uiManager = new UIManager(phaseManager);
        uiManager.init();
    }
});
