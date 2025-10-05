/**
 * AI Darwin Awards Phase Management System - Simplified
 * Manually configurable phases for the awards cycle
 */

const SitePhases = {
    NOMINATION: 'nomination',
    VOTING: 'voting', 
    RESULTS_PENDING: 'results_pending',
    RESULTS_AVAILABLE: 'results_available'
};

// CONFIGURATION: Change this to set the current phase manually
const CURRENT_PHASE = SitePhases.NOMINATION;
const CURRENT_YEAR = 2025;
const AWARDS_YEAR = 2025; // The year being awarded

class PhaseManager {
    constructor() {
        this.currentPhase = CURRENT_PHASE;
        this.currentYear = CURRENT_YEAR;
        this.awardsYear = AWARDS_YEAR;
    }

    getCurrentPhase() {
        return this.currentPhase;
    }

    getPhaseConfig() {
        const navigationItems = this.getNavigationItems();
        
        return {
            phase: this.currentPhase,
            awardsYear: this.awardsYear,
            currentYear: this.currentYear,
            showNavigation: navigationItems.length > 0, // Derived from navigation items
            navigation: navigationItems,
            primaryCTA: this.getPrimaryCTA(),
            secondaryActions: this.getSecondaryActions()
        };
    }

    getNavigationItems() {
        const items = [];

        // Simple navigation based on current phase
        // Only show navigation for non-nomination phases or when explicitly configured
        const shouldShow = this.currentYear >= 2026 || this.currentPhase !== SitePhases.NOMINATION;
        
        if (!shouldShow) {
            return items; // Empty array = no navigation
        }

        // Phase-specific navigation
        switch (this.currentPhase) {
            case SitePhases.VOTING:
                items.push({
                    href: `nominees-${this.awardsYear}.html`,
                    text: `${this.awardsYear} Nominees`,
                    current: false
                });
                items.push({
                    href: 'vote.html',
                    text: 'Vote',
                    current: false,
                    highlight: true
                });
                if (this.currentYear > this.awardsYear) {
                    items.push({
                        href: `nominees-${this.currentYear}.html`,
                        text: `${this.currentYear} Nominees`,
                        current: false
                    });
                }
                break;

            case SitePhases.RESULTS_PENDING:
                items.push({
                    href: `nominees-${this.awardsYear}.html`,
                    text: `${this.awardsYear} Nominees`,
                    current: false
                });
                if (this.currentYear > this.awardsYear) {
                    items.push({
                        href: `nominees-${this.currentYear}.html`,
                        text: `${this.currentYear} Nominees`,
                        current: false
                    });
                }
                break;

            case SitePhases.RESULTS_AVAILABLE:
                if (this.awardsYear === 2025) {
                    items.push({
                        href: `winners-${this.awardsYear}.html`,
                        text: `${this.awardsYear} Winners`,
                        current: false,
                        highlight: true
                    });
                } else {
                    items.push({
                        href: 'winners.html',
                        text: 'Winners',
                        current: false,
                        highlight: true
                    });
                }
                if (this.currentYear > this.awardsYear) {
                    items.push({
                        href: `nominees-${this.currentYear}.html`,
                        text: `${this.currentYear} Nominees`,
                        current: false
                    });
                }
                break;

            case SitePhases.NOMINATION:
            default:
                items.push({
                    href: `nominees-${this.currentYear}.html`,
                    text: `${this.currentYear} Nominees`,
                    current: false
                });
                
                if (this.currentYear > 2025) {
                    if (this.awardsYear === 2025) {
                        items.push({
                            href: `winners-${this.awardsYear}.html`,
                            text: `${this.awardsYear} Winners`,
                            current: false
                        });
                    } else {
                        items.push({
                            href: 'winners.html',
                            text: 'Winners',
                            current: false
                        });
                    }
                }
                break;
        }

        return items;
    }

    getPrimaryCTA() {
        switch (this.currentPhase) {
            case SitePhases.VOTING:
                return {
                    href: 'vote.html',
                    text: `Vote for ${this.awardsYear} Winners`,
                    subtext: 'Voting Open Until January 31st',
                    highlight: true
                };

            case SitePhases.RESULTS_PENDING:
                return {
                    href: `nominees-${this.awardsYear}.html`,
                    text: `${this.awardsYear} Nominees`,
                    subtext: 'Results Coming Soon!',
                    highlight: false
                };

            case SitePhases.RESULTS_AVAILABLE:
                const winnersHref = this.awardsYear === 2025 ? 
                    `winners-${this.awardsYear}.html` : 'winners.html';
                return {
                    href: winnersHref,
                    text: `See ${this.awardsYear} Winners`,
                    subtext: 'The Most Spectacular AI Failures',
                    highlight: true
                };

            case SitePhases.NOMINATION:
            default:
                return {
                    href: `nominees-${this.currentYear}.html`,
                    text: `See the Latest Nominees for ${this.currentYear}`,
                    subtext: 'When AI Meets Human Overconfidence',
                    highlight: false
                };
        }
    }

    getSecondaryActions() {
        const actions = [];

        switch (this.currentPhase) {
            case SitePhases.VOTING:
                actions.push({
                    href: `nominees-${this.awardsYear}.html`,
                    text: `View ${this.awardsYear} Nominees`
                });
                if (this.currentYear > this.awardsYear) {
                    actions.push({
                        href: `nominees-${this.currentYear}.html`,
                        text: `Browse ${this.currentYear} Nominees`
                    });
                }
                break;

            case SitePhases.RESULTS_PENDING:
                if (this.currentYear > this.awardsYear) {
                    actions.push({
                        href: 'nominate.html',
                        text: `Nominate for ${this.currentYear}`
                    });
                    actions.push({
                        href: `nominees-${this.currentYear}.html`,
                        text: `View ${this.currentYear} Nominees`
                    });
                }
                break;

            case SitePhases.RESULTS_AVAILABLE:
                if (this.currentYear > this.awardsYear) {
                    actions.push({
                        href: 'nominate.html',
                        text: `Nominate for ${this.currentYear}`
                    });
                    actions.push({
                        href: `nominees-${this.currentYear}.html`,
                        text: `View ${this.currentYear} Nominees`
                    });
                }
                break;

            case SitePhases.NOMINATION:
            default:
                if (this.currentYear > 2025) {
                    const winnersHref = this.awardsYear === 2025 ? 
                        `winners-${this.awardsYear}.html` : 'winners.html';
                    actions.push({
                        href: winnersHref,
                        text: `See ${this.awardsYear} Winners`
                    });
                }
                break;
        }

        return actions;
    }

    getStatusMessage() {
        switch (this.currentPhase) {
            case SitePhases.VOTING:
                return {
                    type: 'info',
                    icon: '🗳️',
                    message: `Voting is now open for the ${this.awardsYear} AI Darwin Awards! Cast your vote by January 31st.`,
                    dismissible: true
                };

            case SitePhases.RESULTS_PENDING:
                return {
                    type: 'info',
                    icon: '⏳',
                    message: `Voting has closed for ${this.awardsYear}. Results will be announced soon!`,
                    dismissible: false
                };

            case SitePhases.RESULTS_AVAILABLE:
                return {
                    type: 'success',
                    icon: '🏆',
                    message: `The ${this.awardsYear} AI Darwin Award winners have been announced!`,
                    dismissible: true
                };

            default:
                return null;
        }
    }
}

// Initialize phase manager
const phaseManager = new PhaseManager();
