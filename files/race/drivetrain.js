class DrivetrainView {
    constructor(engine, transmission, tire, vehicle) {
        this.engine = engine;
        this.transmission = transmission;
        this.tire = tire;
        this.vehicle = vehicle;
        this.charts = {};
        this.simulationData = null;
        this.currentFrame = 0;
        this.isPlaying = false;
        this.animationId = null;
        this.canvas = null;
        this.ctx = null;

        this.render();
        this.setupControls();
        this.setupCanvas();
        this.createCharts();
    }

    render() {
        const container = document.getElementById('drivetrain-view');
        container.innerHTML = `
            <div class="drivetrain-container">
                <div class="controls" style="grid-row: span 2;">
                    <div class="control-section">
                        <h3>ENGINE</h3>
                        ${this.createSlider('cylinders', 'Cylinders', this.engine.cylinders, 2, 12, 1, '')}
                        ${this.createSlider('displacement', 'Displacement', this.engine.displacement, 0.5, 8.0, 0.1, 'L')}
                        ${this.createSlider('redlineRPM', 'Redline', this.engine.redlineRPM, 4000, 10000, 100, 'RPM')}
                        ${this.createSlider('peakTorqueRPM', 'Peak Torque RPM', this.engine.peakTorqueRPM, 800, 10000, 100, '')}
                        ${this.createSlider('specificTorque', 'Specific Torque', this.engine.specificTorque, 60, 150, 5, 'Nm/L')}
                        ${this.createSlider('torqueShape', 'Curve Shape', this.engine.torqueShape, 0.5, 2.0, 0.1, '')}
                    </div>

                    <div class="control-section">
                        <h3>TRANSMISSION</h3>
                        ${this.createSlider('gear1', 'Gear 1', this.transmission.gearRatios[0], 0.5, 5.0, 0.05, '')}
                        ${this.createSlider('gear2', 'Gear 2', this.transmission.gearRatios[1], 0.5, 5.0, 0.05, '')}
                        ${this.createSlider('gear3', 'Gear 3', this.transmission.gearRatios[2], 0.5, 5.0, 0.05, '')}
                        ${this.createSlider('gear4', 'Gear 4', this.transmission.gearRatios[3], 0.5, 5.0, 0.05, '')}
                        ${this.createSlider('gear5', 'Gear 5', this.transmission.gearRatios[4], 0.5, 5.0, 0.05, '')}
                        ${this.createSlider('gear6', 'Gear 6', this.transmission.gearRatios[5], 0.5, 5.0, 0.05, '')}
                        ${this.createSlider('finalDrive', 'Final Drive', this.transmission.finalDrive, 2.0, 5.0, 0.1, '')}
                    </div>

                    <div class="control-section">
                        <h3>TIRES</h3>
                        ${this.createSlider('tireRadius', 'Tire Radius', this.tire.radius, 0.25, 0.40, 0.01, 'm')}
                        ${this.createSlider('normalLoad', 'Normal Load', this.tire.normalLoad, 1000, 6000, 100, 'N')}
                        ${this.createSlider('frictionCoeff', 'Friction Coeff (μ)', this.tire.frictionCoeff, 0.5, 1.5, 0.05, '')}
                        <h4 style="margin-top: 15px; margin-bottom: 10px; font-size: 12px; color: #888;">Longitudinal (F_x)</h4>
                        ${this.createSlider('pacejkaB', 'B (stiffness)', this.tire.B, 5, 20, 0.5, '')}
                        ${this.createSlider('pacejkaC', 'C (shape)', this.tire.C, 1.0, 2.5, 0.05, '')}
                        ${this.createSlider('pacejkaE', 'E (curvature)', this.tire.E, -1.0, 1.0, 0.05, '')}
                        <h4 style="margin-top: 15px; margin-bottom: 10px; font-size: 12px; color: #888;">Lateral (F_y)</h4>
                        ${this.createSlider('pacejkaB_lat', 'B_lat (stiffness)', this.tire.B_lat, 5, 20, 0.5, '')}
                        ${this.createSlider('pacejkaC_lat', 'C_lat (shape)', this.tire.C_lat, 1.0, 2.5, 0.05, '')}
                        ${this.createSlider('pacejkaE_lat', 'E_lat (curvature)', this.tire.E_lat, -2.0, 1.0, 0.05, '')}
                    </div>

                    <div class="control-section">
                        <h3>VEHICLE</h3>
                        ${this.createSlider('mass', 'Mass', this.vehicle.mass, 800, 2000, 50, 'kg')}
                        ${this.createSlider('dragCoeff', 'Drag Coeff (Cd)', this.vehicle.dragCoeff, 0.2, 0.5, 0.01, '')}
                        ${this.createSlider('frontalArea', 'Frontal Area', this.vehicle.frontalArea, 1.5, 3.0, 0.1, 'm²')}
                        ${this.createSlider('rollingResist', 'Rolling Resist', this.vehicle.rollingResistCoeff, 0.005, 0.030, 0.001, '')}
                        ${this.createSlider('weightDist', 'Weight Dist (front)', this.vehicle.weightDistribution, 0.3, 0.7, 0.05, '')}

                        <div style="margin-top: 20px;">
                            <button id="run-0to60" style="width: 100%; padding: 10px; background: #d45113; color: #fdf9f3; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-bottom: 8px;">
                                Run 0-60 Simulation
                            </button>
                            <button id="run-quarter" style="width: 100%; padding: 10px; background: #4ea699; color: #fdf9f3; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                                Run Quarter Mile
                            </button>
                            <div id="sim-results" style="margin-top: 15px; padding: 10px; background: rgba(35, 12, 15, 0.5); border-radius: 4px; border: 1px solid rgba(181, 166, 66, 0.3); font-size: 12px; color: #ffe9d3; min-height: 80px;">
                                <div style="color: #b5a642; text-align: center; padding: 20px;">Run a simulation to see results</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="race-sim-view">
                    <canvas id="race-canvas" style="width: 100%; height: 100%;"></canvas>
                    <div id="telemetry" style="position: absolute; top: 20px; right: 20px; background: rgba(78, 56, 34, 0.95); padding: 20px; border-radius: 8px; border: 1px solid rgba(181, 166, 66, 0.5); font-family: monospace; color: #b5a642; min-width: 200px; display: none;">
                        <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
                            <span id="tel-speed">0</span> <span style="font-size: 14px;">mph</span>
                        </div>
                        <div style="font-size: 14px; color: #ffe9d3; margin-bottom: 5px;">
                            RPM: <span id="tel-rpm" style="color: #d45113;">0</span>
                        </div>
                        <div style="font-size: 14px; color: #ffe9d3; margin-bottom: 5px;">
                            Gear: <span id="tel-gear" style="color: #4ea699;">1</span>
                        </div>
                        <div style="font-size: 14px; color: #ffe9d3; margin-bottom: 5px;">
                            Time: <span id="tel-time" style="color: #b5a642;">0.00s</span>
                        </div>
                        <div style="font-size: 14px; color: #ffe9d3;">
                            Distance: <span id="tel-distance" style="color: #d496a7;">0</span> ft
                        </div>
                    </div>
                </div>

                <div class="charts">
                    <div class="chart-container">
                        <h3>Engine Torque (N·m)</h3>
                        <canvas id="torque-chart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Engine Power (kW)</h3>
                        <canvas id="power-chart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Longitudinal Force vs Slip Ratio (F_x)</h3>
                        <canvas id="tire-force-chart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Lateral Force vs Slip Angle (F_y)</h3>
                        <canvas id="lateral-force-chart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Friction Circle (F_x vs F_y)</h3>
                        <canvas id="friction-circle-chart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Speed vs RPM (Each Gear)</h3>
                        <canvas id="speed-chart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Wheel Torque vs Speed</h3>
                        <canvas id="wheel-torque-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    setupCanvas() {
        this.canvas = document.getElementById('race-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        if (!this.isPlaying) {
            this.drawIdle();
        }
    }

    drawIdle() {
        const w = this.canvas.width / window.devicePixelRatio;
        const h = this.canvas.height / window.devicePixelRatio;
        this.ctx.fillStyle = '#230c0f';
        this.ctx.fillRect(0, 0, w, h);

        this.drawRoad(w, h);
        this.drawPlainLine(50, h, '#b5a642');

        this.ctx.fillStyle = '#b5a642';
        this.ctx.font = '18px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Run a simulation to see animation', w / 2, h / 2);
    }

    drawRoad(w, h) {
        const roadY = h * 0.6;
        const roadHeight = h * 0.3;
        this.ctx.fillStyle = '#4e3822';
        this.ctx.fillRect(0, roadY, w, roadHeight);
        this.ctx.strokeStyle = '#b5a642';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([15, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, roadY + roadHeight / 2);
        this.ctx.lineTo(w, roadY + roadHeight / 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = '#ffe9d3';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, roadY);
        this.ctx.lineTo(w, roadY);
        this.ctx.moveTo(0, roadY + roadHeight);
        this.ctx.lineTo(w, roadY + roadHeight);
        this.ctx.stroke();
    }

    drawPlainLine(x, h, color) {
        const roadY = h * 0.6;
        const roadHeight = h * 0.3;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(x, roadY);
        this.ctx.lineTo(x, roadY + roadHeight);
        this.ctx.stroke();
    }

    drawCheckeredLine(x, h) {
        const roadY = h * 0.6;
        const roadHeight = h * 0.3;
        const squares = 6;
        const squareSize = roadHeight / squares;
        for (let i = 0; i < squares; i++) {
            this.ctx.fillStyle = i % 2 === 0 ? '#fdf9f3' : '#230c0f';
            this.ctx.fillRect(x - 5, roadY + i * squareSize, 10, squareSize);
        }
    }

    drawCar(x, h) {
        const roadY = h * 0.6;
        const carWidth = 60;
        const carHeight = 28;
        const carY = roadY + (h * 0.3 - carHeight) / 2;
        this.ctx.fillStyle = '#d45113';
        this.ctx.fillRect(x, carY, carWidth, carHeight);
        this.ctx.fillStyle = '#51355a';
        this.ctx.fillRect(x + 15, carY - 12, 30, 12);
        this.ctx.fillStyle = '#230c0f';
        const wheelRadius = 6;
        this.ctx.beginPath();
        this.ctx.arc(x + 12, carY + carHeight, wheelRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + carWidth - 12, carY + carHeight, wheelRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#b5a642';
        this.ctx.beginPath();
        this.ctx.arc(x + 12, carY + carHeight, wheelRadius / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + carWidth - 12, carY + carHeight, wheelRadius / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    updateTelemetry(data) {
        document.getElementById('tel-speed').textContent = Math.round(data.velocityMPH);
        document.getElementById('tel-rpm').textContent = Math.round(data.engineRPM);
        document.getElementById('tel-gear').textContent = data.gear;
        document.getElementById('tel-time').textContent = data.time.toFixed(2);
        const distanceFeet = data.position * 3.28084;
        document.getElementById('tel-distance').textContent = Math.round(distanceFeet);
    }

    createSlider(id, label, value, min, max, step, unit) {
        const decimals = step >= 1 ? 0 : (step === 0.1 ? 1 : 2);
        const displayValue = value.toFixed(decimals);

        return `
            <div class="control-group">
                <label>${label}: <span class="value" id="${id}-value">${displayValue}${unit}</span></label>
                <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">
            </div>
        `;
    }

    setupControls() {
        // Engine controls
        this.setupControl('cylinders', (v) => { this.engine.cylinders = Math.round(v); }, '');
        this.setupControl('displacement', (v) => { this.engine.displacement = v; }, 'L', 1);
        this.setupControl('redlineRPM', (v) => { this.engine.redlineRPM = v; }, 'RPM', 0);
        this.setupControl('peakTorqueRPM', (v) => { this.engine.peakTorqueRPM = v; }, '', 0);
        this.setupControl('specificTorque', (v) => { this.engine.specificTorque = v; }, 'Nm/L', 0);
        this.setupControl('torqueShape', (v) => { this.engine.torqueShape = v; }, '', 1);

        // Transmission controls
        for (let i = 0; i < 6; i++) {
            this.setupControl(`gear${i + 1}`, (v) => { this.transmission.gearRatios[i] = v; }, '', 2);
        }
        this.setupControl('finalDrive', (v) => { this.transmission.finalDrive = v; }, '', 2);

        // Tire controls
        this.setupControl('tireRadius', (v) => {
            this.tire.radius = v;
            this.transmission.tireRadius = v;  // Keep transmission in sync
        }, 'm', 2);
        this.setupControl('normalLoad', (v) => { this.tire.normalLoad = v; }, 'N', 0);
        this.setupControl('frictionCoeff', (v) => { this.tire.frictionCoeff = v; }, '', 2);
        this.setupControl('pacejkaB', (v) => { this.tire.B = v; }, '', 1);
        this.setupControl('pacejkaC', (v) => { this.tire.C = v; }, '', 2);
        this.setupControl('pacejkaE', (v) => { this.tire.E = v; }, '', 2);
        this.setupControl('pacejkaB_lat', (v) => { this.tire.B_lat = v; }, '', 1);
        this.setupControl('pacejkaC_lat', (v) => { this.tire.C_lat = v; }, '', 2);
        this.setupControl('pacejkaE_lat', (v) => { this.tire.E_lat = v; }, '', 2);

        // Vehicle controls
        this.setupControl('mass', (v) => { this.vehicle.mass = v; }, 'kg', 0);
        this.setupControl('dragCoeff', (v) => { this.vehicle.dragCoeff = v; }, '', 2);
        this.setupControl('frontalArea', (v) => { this.vehicle.frontalArea = v; }, 'm²', 1);
        this.setupControl('rollingResist', (v) => { this.vehicle.rollingResistCoeff = v; }, '', 3);
        this.setupControl('weightDist', (v) => { this.vehicle.weightDistribution = v; }, '', 2);

        // Simulation buttons
        document.getElementById('run-0to60').addEventListener('click', () => this.run0to60());
        document.getElementById('run-quarter').addEventListener('click', () => this.runQuarterMile());
    }

    run0to60() {
        this.resizeCanvas();
        const result = this.vehicle.simulate0to60();
        const resultsDiv = document.getElementById('sim-results');

        if (result.success && result.data && result.data.length > 0) {
            this.simulationData = result.data;
            this.simulationType = '0to60';
            this.currentFrame = 0;
            this.isPlaying = true;
            this.maxDistance = Math.max(...result.data.map(d => d.position));

            const tireLimited = result.data.filter(d => d.tireLimited).length > result.data.length / 2;
            resultsDiv.innerHTML = `
                <div style="color: #b5a642; font-weight: 600; margin-bottom: 8px;">0-60 mph: ${result.time0to60.toFixed(2)}s</div>
                <div style="color: #ffe9d3;">
                    <div>Limited by: ${tireLimited ? 'Tires (grip)' : 'Engine (power)'}</div>
                    <div>Final gear: ${result.data[result.data.length - 1].gear}</div>
                    <div>Peak acceleration: ${Math.max(...result.data.map(d => d.acceleration)).toFixed(2)} m/s²</div>
                </div>
            `;

            document.getElementById('telemetry').style.display = 'block';
            this.animate();
        } else {
            resultsDiv.innerHTML = `<div style="color: #d45113;">Simulation timeout (>30s)</div>`;
        }
    }

    runQuarterMile() {
        this.resizeCanvas();
        const result = this.vehicle.simulateQuarterMile();
        const resultsDiv = document.getElementById('sim-results');

        if (result.success && result.data && result.data.length > 0) {
            this.simulationData = result.data;
            this.simulationType = 'quarter';
            this.currentFrame = 0;
            this.isPlaying = true;
            this.maxDistance = Math.max(...result.data.map(d => d.position));

            resultsDiv.innerHTML = `
                <div style="color: #b5a642; font-weight: 600; margin-bottom: 8px;">Quarter Mile: ${result.time.toFixed(2)}s</div>
                <div style="color: #ffe9d3;">
                    <div>Trap speed: ${result.trapSpeed.toFixed(1)} mph</div>
                    <div>Final gear: ${result.data[result.data.length - 1].gear}</div>
                </div>
            `;

            document.getElementById('telemetry').style.display = 'block';
            this.animate();
        } else {
            resultsDiv.innerHTML = `<div style="color: #d45113;">Simulation timeout (>60s)</div>`;
        }
    }

    animate() {
        if (!this.simulationData) return;

        const w = this.canvas.width / window.devicePixelRatio;
        const h = this.canvas.height / window.devicePixelRatio;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        let data = this.simulationData[this.currentFrame];
        const isFinished = !data;

        if (isFinished) {
            data = this.simulationData[this.simulationData.length - 1];
            if (this.isPlaying) {
                this.isPlaying = false;
            }
        }

        // Draw race canvas
        this.ctx.fillStyle = '#230c0f';
        this.ctx.fillRect(0, 0, w, h);
        this.drawRoad(w, h);

        const trackWidth = w - 100;
        const finishX = 50 + trackWidth;
        const carX = 50 + (data.position / this.maxDistance) * trackWidth;

        this.drawPlainLine(50, h, '#b5a642');
        this.drawCheckeredLine(finishX, h);
        this.drawCar(carX, h);

        // Update telemetry
        this.updateTelemetry(data);

        // Update chart indicators
        this.updateChartIndicators(data);

        if (this.isPlaying) {
            this.currentFrame++;
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }

    updateChartIndicators(data) {
        // Update torque chart - add current point
        if (this.charts.torque) {
            const torque = this.engine.torqueAtRPM(data.engineRPM);
            if (!this.charts.torque.data.datasets[1]) {
                this.charts.torque.data.datasets.push({
                    label: 'Current',
                    data: [],
                    borderColor: '#fdf9f3',
                    backgroundColor: '#fdf9f3',
                    pointRadius: 8,
                    pointHoverRadius: 8,
                    showLine: false,
                    order: 0
                });
            }
            this.charts.torque.data.datasets[1].data = [{ x: data.engineRPM, y: torque }];
            this.charts.torque.update('none');
        }

        // Update power chart
        if (this.charts.power) {
            const power = this.engine.powerAtRPM(data.engineRPM);
            if (!this.charts.power.data.datasets[1]) {
                this.charts.power.data.datasets.push({
                    label: 'Current',
                    data: [],
                    borderColor: '#fdf9f3',
                    backgroundColor: '#fdf9f3',
                    pointRadius: 8,
                    showLine: false,
                    order: 0
                });
            }
            this.charts.power.data.datasets[1].data = [{ x: data.engineRPM, y: power }];
            this.charts.power.update('none');
        }

        // Update speed vs RPM chart - highlight current gear
        if (this.charts.speed) {
            const speed = data.velocityMPH * 1.60934; // Convert to km/h
            if (!this.charts.speed.data.datasets[6]) {
                this.charts.speed.data.datasets.push({
                    label: 'Current',
                    data: [],
                    borderColor: '#fdf9f3',
                    backgroundColor: '#fdf9f3',
                    pointRadius: 8,
                    showLine: false,
                    order: 0
                });
            }
            this.charts.speed.data.datasets[6].data = [{ x: data.engineRPM, y: speed }];
            this.charts.speed.update('none');
        }

        // Update wheel torque vs speed chart
        if (this.charts.wheelTorque) {
            const speed = data.velocityMPH * 1.60934; // Convert to km/h
            const engineTorque = this.engine.torqueAtRPM(data.engineRPM);
            const wheelTorque = this.transmission.wheelTorque(engineTorque, data.gear);

            if (!this.charts.wheelTorque.data.datasets[6]) {
                this.charts.wheelTorque.data.datasets.push({
                    label: 'Current',
                    data: [],
                    borderColor: '#fdf9f3',
                    backgroundColor: '#fdf9f3',
                    pointRadius: 8,
                    showLine: false,
                    order: 0
                });
            }
            this.charts.wheelTorque.data.datasets[6].data = [{ x: speed, y: wheelTorque }];
            this.charts.wheelTorque.update('none');
        }

        // Update tire force chart - show current slip ratio and force
        if (this.charts.tireForce) {
            // Calculate approximate slip ratio from current state
            // This is simplified - in reality we'd need wheel speed vs vehicle speed
            const slipRatio = 0.1; // Simplified - assume optimal slip during acceleration
            const force = this.tire.longitudinalForce(slipRatio);

            if (!this.charts.tireForce.data.datasets[1]) {
                this.charts.tireForce.data.datasets.push({
                    label: 'Current',
                    data: [],
                    borderColor: '#fdf9f3',
                    backgroundColor: '#fdf9f3',
                    pointRadius: 8,
                    showLine: false,
                    order: 0
                });
            }
            this.charts.tireForce.data.datasets[1].data = [{ x: slipRatio * 100, y: force }];
            this.charts.tireForce.update('none');
        }

        // Update friction circle - show current longitudinal/lateral force balance
        if (this.charts.frictionCircle) {
            // During straight-line acceleration, lateral force is ~0
            const engineTorque = this.engine.torqueAtRPM(data.engineRPM);
            const wheelTorque = this.transmission.wheelTorque(engineTorque, data.gear);
            const wheelForce = wheelTorque / this.tire.radius;

            // Limit by tire grip
            const maxTireForce = this.tire.peakForce * 2; // Two rear tires
            const fx = Math.min(wheelForce, maxTireForce);
            const fy = 0; // Straight line, no lateral force

            if (!this.charts.frictionCircle.data.datasets[1]) {
                this.charts.frictionCircle.data.datasets.push({
                    label: 'Current',
                    data: [],
                    borderColor: '#fdf9f3',
                    backgroundColor: '#fdf9f3',
                    pointRadius: 8,
                    showLine: false,
                    order: 0
                });
            }
            this.charts.frictionCircle.data.datasets[1].data = [{ x: fx, y: fy }];
            this.charts.frictionCircle.update('none');
        }
    }

    setupControl(id, updateFn, unit, decimals = 0) {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(`${id}-value`);

        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            updateFn(value);
            valueDisplay.textContent = `${value.toFixed(decimals)}${unit}`;
            this.updateCharts();
        });
    }

    createCharts() {
        const chartDefaults = {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { color: 'rgba(181, 166, 66, 0.2)' }, ticks: { color: '#ffe9d3' } },
                y: { grid: { color: 'rgba(181, 166, 66, 0.2)' }, ticks: { color: '#ffe9d3' } }
            }
        };

        // Torque chart
        const torqueData = this.engine.getTorqueCurve();
        this.charts.torque = new Chart(document.getElementById('torque-chart'), {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Torque',
                    data: torqueData.map(d => ({ x: d.rpm, y: d.torque })),
                    borderColor: '#d45113',
                    backgroundColor: 'rgba(212, 81, 19, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                ...chartDefaults,
                scales: {
                    ...chartDefaults.scales,
                    x: { ...chartDefaults.scales.x, type: 'linear', title: { display: true, text: 'RPM', color: '#ffe9d3' } },
                    y: { ...chartDefaults.scales.y, title: { display: true, text: 'N·m', color: '#ffe9d3' } }
                }
            }
        });

        // Power chart
        const powerData = this.engine.getPowerCurve();
        this.charts.power = new Chart(document.getElementById('power-chart'), {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Power',
                    data: powerData.map(d => ({ x: d.rpm, y: d.power })),
                    borderColor: '#4ea699',
                    backgroundColor: 'rgba(78, 166, 153, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                ...chartDefaults,
                scales: {
                    ...chartDefaults.scales,
                    x: { ...chartDefaults.scales.x, type: 'linear', title: { display: true, text: 'RPM', color: '#ffe9d3' } },
                    y: { ...chartDefaults.scales.y, title: { display: true, text: 'kW', color: '#ffe9d3' } }
                }
            }
        });

        // Tire force vs slip ratio chart
        const tireForceData = this.tire.getForceCurve();
        this.charts.tireForce = new Chart(document.getElementById('tire-force-chart'), {
            type: 'line',
            data: {
                labels: tireForceData.map(d => (d.slip * 100).toFixed(1)),
                datasets: [{
                    label: 'Longitudinal Force',
                    data: tireForceData.map(d => d.force),
                    borderColor: '#b5a642',
                    backgroundColor: 'rgba(181, 166, 66, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...chartDefaults,
                scales: {
                    ...chartDefaults.scales,
                    x: { ...chartDefaults.scales.x, title: { display: true, text: 'Slip Ratio (%)', color: '#ffe9d3' } },
                    y: { ...chartDefaults.scales.y, title: { display: true, text: 'Force (N)', color: '#ffe9d3' } }
                }
            }
        });

        // Lateral force vs slip angle chart
        const lateralForceData = this.tire.getLateralForceCurve();
        this.charts.lateralForce = new Chart(document.getElementById('lateral-force-chart'), {
            type: 'line',
            data: {
                labels: lateralForceData.map(d => d.angle.toFixed(1)),
                datasets: [{
                    label: 'Lateral Force',
                    data: lateralForceData.map(d => d.force),
                    borderColor: '#d496a7',
                    backgroundColor: 'rgba(212, 150, 167, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...chartDefaults,
                scales: {
                    ...chartDefaults.scales,
                    x: { ...chartDefaults.scales.x, title: { display: true, text: 'Slip Angle (°)', color: '#ffe9d3' } },
                    y: { ...chartDefaults.scales.y, title: { display: true, text: 'Force (N)', color: '#ffe9d3' } }
                }
            }
        });

        // Friction circle chart
        const frictionCircleData = this.tire.getFrictionCircle();
        this.charts.frictionCircle = new Chart(document.getElementById('friction-circle-chart'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Friction Envelope',
                    data: frictionCircleData.map(d => ({ x: d.fx, y: d.fy })),
                    borderColor: '#b5a642',
                    backgroundColor: 'rgba(181, 166, 66, 0.3)',
                    showLine: true,
                    pointRadius: 0,
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                ...chartDefaults,
                aspectRatio: 1,
                scales: {
                    x: {
                        ...chartDefaults.scales.x,
                        type: 'linear',
                        title: { display: true, text: 'Longitudinal Force F_x (N)', color: '#ffe9d3' },
                        min: -this.tire.peakForce * 1.1,
                        max: this.tire.peakForce * 1.1
                    },
                    y: {
                        ...chartDefaults.scales.y,
                        title: { display: true, text: 'Lateral Force F_y (N)', color: '#ffe9d3' },
                        min: -this.tire.peakForce * 1.1,
                        max: this.tire.peakForce * 1.1
                    }
                }
            }
        });

        // Speed vs RPM chart
        const speedData = this.transmission.getSpeedVsRPM(this.engine);
        const gearColors = ['#d45113', '#b5a642', '#4ea699', '#d496a7', '#51355a', '#dcf3f0'];

        this.charts.speed = new Chart(document.getElementById('speed-chart'), {
            type: 'line',
            data: {
                datasets: speedData.map((gearData, i) => ({
                    label: `Gear ${gearData.gear}`,
                    data: gearData.data.map(d => ({ x: d.rpm, y: d.speed })),
                    borderColor: gearColors[i],
                    backgroundColor: 'transparent',
                    pointRadius: 0,
                    borderWidth: 2
                }))
            },
            options: {
                ...chartDefaults,
                plugins: {
                    legend: { display: true, labels: { color: '#ffe9d3' } }
                },
                scales: {
                    ...chartDefaults.scales,
                    x: { ...chartDefaults.scales.x, type: 'linear', title: { display: true, text: 'RPM', color: '#ffe9d3' } },
                    y: { ...chartDefaults.scales.y, title: { display: true, text: 'km/h', color: '#ffe9d3' } }
                }
            }
        });

        // Wheel torque vs speed chart
        const wheelTorqueData = this.transmission.getWheelTorqueVsSpeed(this.engine);

        this.charts.wheelTorque = new Chart(document.getElementById('wheel-torque-chart'), {
            type: 'line',
            data: {
                datasets: wheelTorqueData.map((gearData, i) => ({
                    label: `Gear ${gearData.gear}`,
                    data: gearData.data.map(d => ({ x: d.speed, y: d.torque })),
                    borderColor: gearColors[i],
                    backgroundColor: 'transparent',
                    pointRadius: 0,
                    borderWidth: 2
                }))
            },
            options: {
                ...chartDefaults,
                plugins: {
                    legend: { display: true, labels: { color: '#ffe9d3' } }
                },
                scales: {
                    ...chartDefaults.scales,
                    x: { ...chartDefaults.scales.x, type: 'linear', title: { display: true, text: 'km/h', color: '#ffe9d3' } },
                    y: { ...chartDefaults.scales.y, title: { display: true, text: 'Wheel Torque (N·m)', color: '#ffe9d3' } }
                }
            }
        });
    }

    updateCharts() {
        // Update torque chart
        const torqueData = this.engine.getTorqueCurve();
        this.charts.torque.data.datasets[0].data = torqueData.map(d => ({ x: d.rpm, y: d.torque }));
        // Remove current indicator when parameters change
        if (this.charts.torque.data.datasets[1]) {
            this.charts.torque.data.datasets.splice(1, 1);
        }
        this.charts.torque.update('none'); // 'none' = no animation for better performance

        // Update power chart
        const powerData = this.engine.getPowerCurve();
        this.charts.power.data.datasets[0].data = powerData.map(d => ({ x: d.rpm, y: d.power }));
        if (this.charts.power.data.datasets[1]) {
            this.charts.power.data.datasets.splice(1, 1);
        }
        this.charts.power.update('none');

        // Update tire force chart
        const tireForceData = this.tire.getForceCurve();
        this.charts.tireForce.data.labels = tireForceData.map(d => (d.slip * 100).toFixed(1));
        this.charts.tireForce.data.datasets[0].data = tireForceData.map(d => d.force);
        if (this.charts.tireForce.data.datasets[1]) {
            this.charts.tireForce.data.datasets.splice(1, 1);
        }
        this.charts.tireForce.update('none');

        // Update lateral force chart
        const lateralForceData = this.tire.getLateralForceCurve();
        this.charts.lateralForce.data.labels = lateralForceData.map(d => d.angle.toFixed(1));
        this.charts.lateralForce.data.datasets[0].data = lateralForceData.map(d => d.force);
        this.charts.lateralForce.update('none');

        // Update friction circle chart
        const frictionCircleData = this.tire.getFrictionCircle();
        this.charts.frictionCircle.data.datasets[0].data = frictionCircleData.map(d => ({ x: d.fx, y: d.fy }));
        this.charts.frictionCircle.options.scales.x.min = -this.tire.peakForce * 1.1;
        this.charts.frictionCircle.options.scales.x.max = this.tire.peakForce * 1.1;
        this.charts.frictionCircle.options.scales.y.min = -this.tire.peakForce * 1.1;
        this.charts.frictionCircle.options.scales.y.max = this.tire.peakForce * 1.1;
        if (this.charts.frictionCircle.data.datasets[1]) {
            this.charts.frictionCircle.data.datasets.splice(1, 1);
        }
        this.charts.frictionCircle.update('none');

        // Update speed chart
        const speedData = this.transmission.getSpeedVsRPM(this.engine);
        this.charts.speed.data.datasets = speedData.map((gearData, i) => {
            const existingDataset = this.charts.speed.data.datasets[i] || {};
            return {
                ...existingDataset,
                data: gearData.data.map(d => ({ x: d.rpm, y: d.speed }))
            };
        });
        this.charts.speed.update('none');

        // Update wheel torque chart
        const wheelTorqueData = this.transmission.getWheelTorqueVsSpeed(this.engine);
        this.charts.wheelTorque.data.datasets = wheelTorqueData.map((gearData, i) => {
            const existingDataset = this.charts.wheelTorque.data.datasets[i] || {};
            return {
                ...existingDataset,
                data: gearData.data.map(d => ({ x: d.speed, y: d.torque }))
            };
        });
        this.charts.wheelTorque.update('none');
    }
}
