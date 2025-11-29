class Transmission {
    constructor() {
        this.numGears = 6;

        // Typical 6-speed ratios (higher = more torque multiplication)
        this.gearRatios = [
            3.50,  // 1st gear
            2.20,  // 2nd gear
            1.55,  // 3rd gear
            1.15,  // 4th gear
            0.95,  // 5th gear
            0.75   // 6th gear (overdrive)
        ];

        this.finalDrive = 3.73;      // Final drive ratio
        this.tireRadius = 0.32;      // Tire radius in meters (~205/55R16)
        this.currentGear = 1;        // Start in 1st gear
    }

    /**
     * Calculate total gear ratio (gear ratio × final drive)
     * gear is 1-indexed (1 = first gear)
     */
    totalRatio(gear) {
        if (gear < 1 || gear > this.numGears) {
            return 0;
        }
        return this.gearRatios[gear - 1] * this.finalDrive;
    }

    /**
     * Calculate wheel torque from engine torque
     * Torque is multiplied by gear ratio
     */
    wheelTorque(engineTorque, gear) {
        const ratio = this.totalRatio(gear);
        if (ratio === 0) {
            return 0;
        }
        return engineTorque * ratio;
    }

    /**
     * Calculate wheel RPM from engine RPM
     * RPM is divided by gear ratio
     */
    wheelRPM(engineRPM, gear) {
        const ratio = this.totalRatio(gear);
        if (ratio === 0) {
            return 0;
        }
        return engineRPM / ratio;
    }

    /**
     * Calculate vehicle speed (m/s) from wheel RPM
     * Speed = wheel_rpm × 2π × radius / 60
     */
    speedFromWheelRPM(wheelRPM) {
        return wheelRPM * 2 * Math.PI * this.tireRadius / 60;
    }

    /**
     * Calculate vehicle speed (m/s) from engine RPM in a given gear
     */
    speedFromEngineRPM(engineRPM, gear) {
        const wheelRPM = this.wheelRPM(engineRPM, gear);
        return this.speedFromWheelRPM(wheelRPM);
    }

    /**
     * Convert m/s to km/h
     */
    static msToKmh(ms) {
        return ms * 3.6;
    }

    /**
     * Get speed vs RPM data for all gears
     * Returns array of {gear, data: [{rpm, speed}]} objects
     */
    getSpeedVsRPM(engine, numPoints = 50) {
        const result = [];

        for (let gear = 1; gear <= this.numGears; gear++) {
            const data = [];
            const rpmStep = (engine.redlineRPM - engine.idleRPM) / (numPoints - 1);

            for (let i = 0; i < numPoints; i++) {
                const rpm = engine.idleRPM + i * rpmStep;
                const speedKmh = Transmission.msToKmh(
                    this.speedFromEngineRPM(rpm, gear)
                );
                data.push({ rpm, speed: speedKmh });
            }

            result.push({ gear, data });
        }

        return result;
    }

    /**
     * Get wheel torque vs speed data for all gears
     * Returns array of {gear, data: [{speed, torque}]} objects
     */
    getWheelTorqueVsSpeed(engine, numPoints = 50) {
        const result = [];

        for (let gear = 1; gear <= this.numGears; gear++) {
            const data = [];
            const rpmStep = (engine.redlineRPM - engine.idleRPM) / (numPoints - 1);

            for (let i = 0; i < numPoints; i++) {
                const rpm = engine.idleRPM + i * rpmStep;
                const engineTorque = engine.torqueAtRPM(rpm);
                const wheelTorque = this.wheelTorque(engineTorque, gear);
                const speedKmh = Transmission.msToKmh(
                    this.speedFromEngineRPM(rpm, gear)
                );
                data.push({ speed: speedKmh, torque: wheelTorque });
            }

            result.push({ gear, data });
        }

        return result;
    }
}
