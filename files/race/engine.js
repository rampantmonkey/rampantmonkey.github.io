class Engine {
    constructor() {
        this.displacement = 2.0;      // Liters
        this.cylinders = 4;           // Number of cylinders
        this.idleRPM = 800;           // Idle RPM
        this.redlineRPM = 7000;       // Maximum RPM
        this.peakTorqueRPM = 4500;    // RPM at peak torque
        this.specificTorque = 100;    // N⋅m per liter (80-150)
        this.torqueShape = 1.0;       // Shape parameter (0.5-2.0)
    }

    /**
     * Calculate torque at a given RPM using a simplified model
     * Returns torque in N⋅m
     */
    torqueAtRPM(rpm) {
        if (rpm < this.idleRPM || rpm > this.redlineRPM) {
            return 0;
        }

        // Calculate peak torque from displacement and specific output
        const peakTorque = this.displacement * this.specificTorque;

        // Cylinder count affects low-end torque
        // More cylinders = smoother but less low-end grunt
        let cylinderFactor = 1.0 - (this.cylinders - 4) * 0.02;
        cylinderFactor = Math.max(0.7, Math.min(1.2, cylinderFactor));

        const peakRPM = this.peakTorqueRPM;

        if (rpm <= peakRPM) {
            // Rising portion: smooth curve from idle to peak
            let t = (rpm - this.idleRPM) / (peakRPM - this.idleRPM);
            // Apply shape factor
            t = Math.pow(t, this.torqueShape);
            return peakTorque * cylinderFactor * (t * 0.85 + 0.15); // Start at 15% of peak
        } else {
            // Falling portion: gradual decline to redline
            const t = (rpm - peakRPM) / (this.redlineRPM - peakRPM);
            // Quadratic falloff - more cylinders handle high RPM better
            const highRPMFactor = 1.0 + (this.cylinders - 4) * 0.01;
            return peakTorque * cylinderFactor * highRPMFactor * (1.0 - 0.4 * t * t);
        }
    }

    /**
     * Calculate power at a given RPM
     * Returns power in kW
     * Power (kW) = Torque (N⋅m) × RPM × 2π / 60000
     */
    powerAtRPM(rpm) {
        const torque = this.torqueAtRPM(rpm);
        return torque * rpm * 0.00010472; // 2π/60000
    }

    /**
     * Get torque curve data for plotting
     * Returns array of {rpm, torque} points
     */
    getTorqueCurve(numPoints = 100) {
        const data = [];
        const rpmStep = (this.redlineRPM - this.idleRPM) / (numPoints - 1);

        for (let i = 0; i < numPoints; i++) {
            const rpm = this.idleRPM + i * rpmStep;
            data.push({
                rpm: rpm,
                torque: this.torqueAtRPM(rpm)
            });
        }

        return data;
    }

    /**
     * Get power curve data for plotting
     * Returns array of {rpm, power} points
     */
    getPowerCurve(numPoints = 100) {
        const data = [];
        const rpmStep = (this.redlineRPM - this.idleRPM) / (numPoints - 1);

        for (let i = 0; i < numPoints; i++) {
            const rpm = this.idleRPM + i * rpmStep;
            data.push({
                rpm: rpm,
                power: this.powerAtRPM(rpm)
            });
        }

        return data;
    }
}
