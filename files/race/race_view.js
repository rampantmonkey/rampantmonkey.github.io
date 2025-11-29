class RaceView {
    constructor(vehicle) {
        this.vehicle = vehicle;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.simulationData = null;
        this.currentFrame = 0;
        this.isPlaying = false;
        this.simulationType = null; // '0to60' or 'quarter'

        this.render();
        this.setupCanvas();
        this.setupControls();
    }

    render() {
        const container = document.getElementById('race-view');
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; height: 100%; background: #230c0f;">
                <div style="padding: 20px; background: #4e3822; border-bottom: 2px solid #b5a642;">
                    <div style="display: flex; gap: 15px; align-items: center;">
                        <button id="race-0to60" style="padding: 12px 24px; background: #d45113; color: #fdf9f3; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 600;">
                            0-60 mph
                        </button>
                        <button id="race-quarter" style="padding: 12px 24px; background: #4ea699; color: #fdf9f3; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 600;">
                            Quarter Mile
                        </button>
                        <button id="race-replay" style="padding: 12px 24px; background: #b5a642; color: #230c0f; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 600; display: none;">
                            Replay
                        </button>
                        <div id="race-status" style="margin-left: auto; color: #ffe9d3; font-size: 14px;">
                            Select a race mode
                        </div>
                    </div>
                </div>
                <div style="flex: 1; position: relative; overflow: hidden;">
                    <canvas id="race-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
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
            </div>
        `;
    }

    setupCanvas() {
        this.canvas = document.getElementById('race-canvas');
        this.ctx = this.canvas.getContext('2d');

        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        // Reset transform before scaling to prevent accumulation
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        if (!this.isPlaying) {
            this.drawIdle();
        }
    }

    setupControls() {
        document.getElementById('race-0to60').addEventListener('click', () => this.start0to60());
        document.getElementById('race-quarter').addEventListener('click', () => this.startQuarterMile());
        document.getElementById('race-replay').addEventListener('click', () => this.replay());
    }

    start0to60() {
        // Ensure canvas is properly sized
        this.resizeCanvas();

        document.getElementById('race-status').textContent = 'Simulating 0-60...';
        const result = this.vehicle.simulate0to60();

        console.log('0-60 simulation result:', result);
        console.log('Data points:', result.data?.length);
        console.log('First point:', result.data?.[0]);
        console.log('Last point:', result.data?.[result.data.length - 1]);

        if (result.success && result.data && result.data.length > 0) {
            this.simulationData = result.data;
            this.simulationType = '0to60';
            this.currentFrame = 0;
            this.isPlaying = true;
            // Cache max distance for animation
            this.maxDistance = Math.max(...result.data.map(d => d.position));
            console.log('Max distance:', this.maxDistance);
            document.getElementById('telemetry').style.display = 'block';
            document.getElementById('race-replay').style.display = 'block';
            this.animate();
        } else {
            document.getElementById('race-status').textContent = 'Simulation failed - no data';
            console.error('0-60 simulation produced no data');
        }
    }

    startQuarterMile() {
        // Ensure canvas is properly sized
        this.resizeCanvas();

        document.getElementById('race-status').textContent = 'Simulating quarter mile...';
        const result = this.vehicle.simulateQuarterMile();

        if (result.success && result.data && result.data.length > 0) {
            this.simulationData = result.data;
            this.simulationType = 'quarter';
            this.currentFrame = 0;
            this.isPlaying = true;
            // Cache max distance for animation
            this.maxDistance = Math.max(...result.data.map(d => d.position));
            document.getElementById('telemetry').style.display = 'block';
            document.getElementById('race-replay').style.display = 'block';
            this.animate();
        } else {
            document.getElementById('race-status').textContent = 'Simulation failed (timeout)';
        }
    }

    replay() {
        if (this.simulationData) {
            this.currentFrame = 0;
            this.isPlaying = true;
            this.animate();
        }
    }

    drawIdle() {
        const w = this.canvas.width / window.devicePixelRatio;
        const h = this.canvas.height / window.devicePixelRatio;

        // Clear
        this.ctx.fillStyle = '#230c0f';
        this.ctx.fillRect(0, 0, w, h);

        // Draw road
        this.drawRoad(0, w, h);

        // Draw start line
        this.drawPlainLine(50, h, '#b5a642');

        // Draw idle message
        this.ctx.fillStyle = '#4e3822';
        this.ctx.font = '24px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Select a race mode to begin', w / 2, h / 2);
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

    drawRoad(offset, w, h) {
        const roadY = h * 0.6;
        const roadHeight = h * 0.3;

        // Road
        this.ctx.fillStyle = '#4e3822';
        this.ctx.fillRect(0, roadY, w, roadHeight);

        // Center line dashes
        this.ctx.strokeStyle = '#b5a642';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([20, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, roadY + roadHeight / 2);
        this.ctx.lineTo(w, roadY + roadHeight / 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Road edges
        this.ctx.strokeStyle = '#ffe9d3';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, roadY);
        this.ctx.lineTo(w, roadY);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(0, roadY + roadHeight);
        this.ctx.lineTo(w, roadY + roadHeight);
        this.ctx.stroke();
    }

    drawCheckeredLine(x, h) {
        const roadY = h * 0.6;
        const roadHeight = h * 0.3;

        // Checkered pattern
        const squares = 6;
        const squareSize = roadHeight / squares;

        for (let i = 0; i < squares; i++) {
            this.ctx.fillStyle = i % 2 === 0 ? '#fdf9f3' : '#230c0f';
            this.ctx.fillRect(x - 5, roadY + i * squareSize, 10, squareSize);
        }
    }

    drawCar(x, h, color = '#d45113') {
        const roadY = h * 0.6;
        const carWidth = 80;
        const carHeight = 35;
        const carY = roadY + (h * 0.3 - carHeight) / 2;

        // Car body
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, carY, carWidth, carHeight);

        // Car roof
        this.ctx.fillStyle = '#51355a';
        this.ctx.fillRect(x + 20, carY - 15, 40, 15);

        // Wheels
        this.ctx.fillStyle = '#230c0f';
        const wheelRadius = 8;
        this.ctx.beginPath();
        this.ctx.arc(x + 15, carY + carHeight, wheelRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + carWidth - 15, carY + carHeight, wheelRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Wheel rims
        this.ctx.fillStyle = '#b5a642';
        this.ctx.beginPath();
        this.ctx.arc(x + 15, carY + carHeight, wheelRadius / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + carWidth - 15, carY + carHeight, wheelRadius / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    updateTelemetry(data) {
        document.getElementById('tel-speed').textContent = Math.round(data.velocityMPH);
        document.getElementById('tel-rpm').textContent = Math.round(data.engineRPM);
        document.getElementById('tel-gear').textContent = data.gear;
        document.getElementById('tel-time').textContent = data.time.toFixed(2);

        // Convert position from meters to feet
        const distanceFeet = data.position * 3.28084;
        document.getElementById('tel-distance').textContent = Math.round(distanceFeet);
    }

    animate() {
        if (!this.simulationData) return;

        const w = this.canvas.width / window.devicePixelRatio;
        const h = this.canvas.height / window.devicePixelRatio;

        // Ensure correct transform
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Clear
        this.ctx.fillStyle = '#230c0f';
        this.ctx.fillRect(0, 0, w, h);

        // Get current data point (or last frame if finished)
        let data = this.simulationData[this.currentFrame];
        const isFinished = !data;

        if (isFinished) {
            // Use last frame for finished state
            data = this.simulationData[this.simulationData.length - 1];
            if (this.isPlaying) {
                this.isPlaying = false;
                this.showFinishMessage();
            }
        }

        // Draw road
        this.drawRoad(0, w, h);

        // Calculate positions
        const trackWidth = w - 200;
        const finishX = 50 + trackWidth;
        const carX = 50 + (data.position / this.maxDistance) * trackWidth;

        // Draw start line
        this.drawPlainLine(50, h, '#b5a642');

        // Draw finish line (checkered)
        this.drawCheckeredLine(finishX, h);

        // Draw car
        this.drawCar(carX, h);

        // Update telemetry
        this.updateTelemetry(data);

        // Update status
        const statusText = this.simulationType === '0to60'
            ? `0-60 mph: ${data.time.toFixed(2)}s`
            : `Quarter Mile: ${data.time.toFixed(2)}s @ ${Math.round(data.velocityMPH)} mph`;
        document.getElementById('race-status').textContent = statusText;

        // Next frame (only if still playing)
        if (this.isPlaying) {
            this.currentFrame++;
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }

    showFinishMessage() {
        const lastData = this.simulationData[this.simulationData.length - 1];
        const message = this.simulationType === '0to60'
            ? `Finished! 0-60 in ${lastData.time.toFixed(2)}s`
            : `Finished! ${lastData.time.toFixed(2)}s @ ${Math.round(lastData.velocityMPH)} mph trap speed`;

        document.getElementById('race-status').textContent = message;
    }
}
