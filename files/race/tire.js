/**
 * Tire model using Pacejka's Magic Formula for both longitudinal and lateral forces
 *
 * Longitudinal (F_x): F_x = D * sin(C * arctan(B * κ - E * (B * κ - arctan(B * κ))))
 * Lateral (F_y): F_y = D * sin(C * arctan(B * α - E * (B * α - arctan(B * α))))
 *
 * Where:
 * - κ (kappa) = slip ratio (for F_x)
 * - α (alpha) = slip angle in radians (for F_y)
 * - D = peak force (μ * F_z)
 * - B = stiffness factor
 * - C = shape factor
 * - E = curvature factor
 */
class Tire {
    constructor() {
        // Basic tire properties
        this.radius = 0.32;              // Tire radius in meters
        this.normalLoad = 3000;          // Normal load on tire (N) - ~300kg per tire for 1200kg car
        this.frictionCoeff = 1.0;        // Grip coefficient (μ) - 1.0 for good street tire

        // Pacejka Magic Formula coefficients for longitudinal force (F_x)
        this.B = 10.0;                   // Stiffness factor (how quickly force builds with slip)
        this.C = 1.65;                   // Shape factor (curve shape, ~1.65 typical for longitudinal)
        this.E = 0.97;                   // Curvature factor (shape at peak, 0-1)

        // Pacejka Magic Formula coefficients for lateral force (F_y)
        this.B_lat = 8.0;                // Lateral stiffness (slightly less than longitudinal)
        this.C_lat = 1.30;               // Lateral shape factor (typically ~1.3)
        this.E_lat = -1.0;               // Lateral curvature (negative for typical tire behavior)

        // The peak force D is calculated as μ * F_z
    }

    /**
     * Calculate peak force D = μ * F_z
     */
    get peakForce() {
        return this.frictionCoeff * this.normalLoad;
    }

    /**
     * Pacejka's Magic Formula for longitudinal force
     *
     * @param {number} slipRatio - Slip ratio κ (kappa)
     *   For acceleration: (V_wheel - V_vehicle) / V_vehicle
     *   For braking: (V_vehicle - V_wheel) / V_vehicle
     *   Typically ranges from -1 (locked wheel) to +1 (wheelspin)
     *
     * @returns {number} Longitudinal force in Newtons
     */
    longitudinalForce(slipRatio) {
        const D = this.peakForce;
        const B = this.B;
        const C = this.C;
        const E = this.E;

        // Magic Formula
        const BK = B * slipRatio;
        const arctan_BK = Math.atan(BK);
        const inner = BK - E * (BK - arctan_BK);

        return D * Math.sin(C * Math.atan(inner));
    }

    /**
     * Calculate slip ratio from wheel speed and vehicle speed
     *
     * @param {number} wheelRPM - Wheel rotational speed in RPM
     * @param {number} vehicleSpeed - Vehicle speed in m/s
     * @returns {number} Slip ratio
     */
    slipRatio(wheelRPM, vehicleSpeed) {
        // Convert wheel RPM to linear velocity
        const wheelSpeed = wheelRPM * 2 * Math.PI * this.radius / 60;

        // Avoid division by zero
        if (Math.abs(vehicleSpeed) < 0.1) {
            return wheelSpeed > 0 ? 1.0 : -1.0;
        }

        // Slip ratio: (V_wheel - V_vehicle) / V_vehicle
        return (wheelSpeed - vehicleSpeed) / Math.abs(vehicleSpeed);
    }

    /**
     * Pacejka's Magic Formula for lateral force (cornering)
     *
     * @param {number} slipAngle - Slip angle α (alpha) in radians
     *   Slip angle is the angle between where the tire is pointing
     *   and where it's actually traveling
     *   Typically ranges from -15° to +15° (-0.26 to +0.26 rad)
     *
     * @returns {number} Lateral force in Newtons
     */
    lateralForce(slipAngle) {
        const D = this.peakForce;
        const B = this.B_lat;
        const C = this.C_lat;
        const E = this.E_lat;

        // Magic Formula (same as longitudinal, but with slip angle)
        const BA = B * slipAngle;
        const arctan_BA = Math.atan(BA);
        const inner = BA - E * (BA - arctan_BA);

        return D * Math.sin(C * Math.atan(inner));
    }

    /**
     * Get longitudinal force vs slip ratio curve data for plotting
     *
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of {slip, force} objects
     */
    getForceCurve(numPoints = 100) {
        const data = [];
        const maxSlip = 1.0;  // -100% to +100% slip

        for (let i = 0; i < numPoints; i++) {
            const slip = -maxSlip + (2 * maxSlip * i) / (numPoints - 1);
            const force = this.longitudinalForce(slip);
            data.push({ slip, force });
        }

        return data;
    }

    /**
     * Get lateral force vs slip angle curve data for plotting
     *
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of {angle, force} objects (angle in degrees)
     */
    getLateralForceCurve(numPoints = 100) {
        const data = [];
        const maxAngleDeg = 15;  // -15° to +15°

        for (let i = 0; i < numPoints; i++) {
            const angleDeg = -maxAngleDeg + (2 * maxAngleDeg * i) / (numPoints - 1);
            const angleRad = angleDeg * Math.PI / 180;
            const force = this.lateralForce(angleRad);
            data.push({ angle: angleDeg, force });
        }

        return data;
    }

    /**
     * Get friction circle data with proper combined slip model
     *
     * The friction circle represents the tire's maximum combined force capability.
     * Theoretical limit: sqrt(F_x^2 + F_y^2) ≤ μ * F_z
     *
     * Our basic Pacejka implementation calculates F_x and F_y independently,
     * which can violate the friction circle. This method applies a combined slip
     * scaling to enforce the physical constraint.
     *
     * @param {number} numPoints - Number of points around the circle
     * @returns {Array} Array of {fx, fy} force combinations
     */
    getFrictionCircle(numPoints = 100) {
        const data = [];
        const maxForce = this.peakForce;

        // For each angle around the circle, find the maximum force magnitude
        for (let i = 0; i < numPoints; i++) {
            const targetAngle = (2 * Math.PI * i) / numPoints;

            let maxForceMag = 0;
            let bestFx = 0;
            let bestFy = 0;

            // Search through slip combinations
            for (let slipRatio = -0.3; slipRatio <= 0.3; slipRatio += 0.01) {
                for (let slipAngleDeg = -15; slipAngleDeg <= 15; slipAngleDeg += 0.5) {
                    const slipAngleRad = slipAngleDeg * Math.PI / 180;

                    // Calculate pure forces
                    let fx = this.longitudinalForce(slipRatio);
                    let fy = this.lateralForce(slipAngleRad);

                    // Apply combined slip scaling to enforce friction circle constraint
                    // If combined force exceeds limit, scale both down proportionally
                    const combinedMag = Math.sqrt(fx * fx + fy * fy);
                    if (combinedMag > maxForce) {
                        const scale = maxForce / combinedMag;
                        fx *= scale;
                        fy *= scale;
                    }

                    // Calculate the magnitude and angle of this (scaled) force
                    const forceMag = Math.sqrt(fx * fx + fy * fy);
                    const forceAngle = Math.atan2(fy, fx);

                    // Normalize angle difference to [-π, π]
                    let angleDiff = forceAngle - targetAngle;
                    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

                    // Only consider forces pointing in roughly the target direction (within 5°)
                    // and keep the maximum magnitude
                    if (Math.abs(angleDiff) < 0.087 && forceMag > maxForceMag) {
                        maxForceMag = forceMag;
                        bestFx = fx;
                        bestFy = fy;
                    }
                }
            }

            data.push({ fx: bestFx, fy: bestFy });
        }

        return data;
    }

    /**
     * Find the slip ratio that gives maximum force
     * Useful for understanding optimal slip for traction
     */
    findOptimalSlip() {
        const curve = this.getForceCurve(200);
        let maxForce = 0;
        let optimalSlip = 0;

        for (const point of curve) {
            if (Math.abs(point.force) > Math.abs(maxForce)) {
                maxForce = point.force;
                optimalSlip = point.slip;
            }
        }

        return { slip: optimalSlip, force: maxForce };
    }

    /**
     * Calculate maximum theoretical acceleration given wheel torque
     *
     * @param {number} wheelTorque - Torque at the wheel (N⋅m)
     * @param {number} vehicleMass - Vehicle mass (kg)
     * @returns {object} {force, maxAccel, limited}
     */
    maxAcceleration(wheelTorque, vehicleMass) {
        // Force the wheel can theoretically apply
        const wheelForce = wheelTorque / this.radius;

        // Maximum force the tire can handle (at optimal slip)
        const maxTireForce = this.peakForce;

        // Actual force is limited by tire grip
        const actualForce = Math.min(wheelForce, maxTireForce);

        // Acceleration = Force / Mass
        const maxAccel = actualForce / vehicleMass;

        return {
            force: actualForce,
            maxAccel: maxAccel,
            limited: wheelForce > maxTireForce  // True if tire-limited, false if engine-limited
        };
    }
}
