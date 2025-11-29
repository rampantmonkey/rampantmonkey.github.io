// Simple app state management and tab switching

class App {
    constructor() {
        this.currentView = 'drivetrain';
        this.engine = new Engine();
        this.transmission = new Transmission();
        this.tire = new Tire();
        this.vehicle = null;
        this.drivetrain = null;
        this.raceView = null;

        // Sync tire radius with transmission
        this.tire.radius = this.transmission.tireRadius;

        // Create vehicle with all components
        this.vehicle = new Vehicle(this.engine, this.transmission, this.tire);

        this.init();
    }

    init() {
        // Set up tab switching
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Initialize views
        this.drivetrain = new DrivetrainView(this.engine, this.transmission, this.tire, this.vehicle);
        this.raceView = new RaceView(this.vehicle);
    }

    switchView(viewName) {
        // Update current view
        this.currentView = viewName;

        // Update tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === viewName);
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
