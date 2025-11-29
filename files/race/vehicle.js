/**
 * Vehicle dynamics model
 *
 * Integrates engine, transmission, and tire models with vehicle physics:
 * - Mass and weight distribution
 * - Aerodynamic drag
 * - Rolling resistance
 * - Longitudinal dynamics (acceleration, braking)
 */
class Vehicle {
    constructor(engine, transmission, tire) {
        this.engine = engine;
        this.transmission = transmission;
        this.tire = tire;

        // Vehicle properties
        this.mass = 1200;                // Total vehicle mass (kg)
        this.weightDistribution = 0.5;   // Front weight fraction (0.5 = 50/50)
        this.wheelbase = 2.6;            // Distance between axles (m)
        this.cgHeight = 0.5;             // Center of gravity height (m)

        // Aerodynamics
        this.frontalArea = 2.2;          // Frontal area (m²)
        this.dragCoeff = 0.30;           // Drag coefficient (Cd)
        this.airDensity = 1.225;         // Air density (kg/m³)

        // Rolling resistance
        this.rollingResistCoeff = 0.015; // Rolling resistance coefficient

        // Simulation state
        this.velocity = 0;               // Current velocity (m/s)
        this.position = 0;               // Current position (m)
        this.wheelAngularVel = 0;        // Wheel angular velocity (rad/s)
        this.currentGear = 1;            // Current gear (1-6)
        this.throttle = 0;               // Throttle position (0-1)

        // Wheel properties
        // Includes wheels, tires, driveshaft, differential, etc.
        this.wheelInertia = 20.0;        // Moment of inertia of all drivetrain (kg⋅m²)
        this.wheelRadius = tire.radius;  // Wheel radius (m)
        this.wheelDamping = 8.0;         // Damping coefficient (N⋅m⋅s/rad)

        // Gear shift management
        this.shiftingCooldown = 0;       // Time since last shift (s)
        this.minShiftInterval = 0.3;     // Minimum time between shifts (s)

        // Constants
        this.gravity = 9.81;             // m/s²
    }

    /**
     * Calculate aerodynamic drag force
     * F_drag = 0.5 * ρ * Cd * A * v²
     */
    dragForce() {
        return 0.5 * this.airDensity * this.dragCoeff * this.frontalArea *
               this.velocity * this.velocity;
    }

    /**
     * Calculate rolling resistance force
     * F_rr = Crr * m * g
     */
    rollingResistance() {
        return this.rollingResistCoeff * this.mass * this.gravity;
    }

    /**
     * Calculate normal load on each tire (simplified, static)
     * In reality this changes with acceleration (weight transfer)
     */
    getNormalLoads() {
        const totalWeight = this.mass * this.gravity;
        const frontLoad = totalWeight * this.weightDistribution;
        const rearLoad = totalWeight * (1 - this.weightDistribution);

        return {
            front: frontLoad / 2,  // Per tire (assuming 4 tires)
            rear: rearLoad / 2
        };
    }

    /**
     * Calculate weight transfer during acceleration/braking
     * Positive acceleration = weight transfers to rear
     * Negative acceleration (braking) = weight transfers to front
     */
    getWeightTransfer(acceleration) {
        const weightTransfer = (this.mass * acceleration * this.cgHeight) / this.wheelbase;
        const totalWeight = this.mass * this.gravity;

        const staticFront = totalWeight * this.weightDistribution;
        const staticRear = totalWeight * (1 - this.weightDistribution);

        return {
            front: (staticFront - weightTransfer) / 2,  // Per tire
            rear: (staticRear + weightTransfer) / 2     // Per tire
        };
    }

    /**
     * Calculate engine RPM from current wheel angular velocity and gear
     */
    getEngineRPM() {
        // Convert wheel angular velocity to RPM
        const wheelRPM = (this.wheelAngularVel * 60) / (2 * Math.PI);

        // Convert wheel RPM to engine RPM via transmission
        const gearRatio = this.transmission.totalRatio(this.currentGear);
        const engineRPM = wheelRPM * gearRatio;

        // At low speeds (launch), engine is held at idle via clutch slip
        // This simulates driver managing clutch engagement
        return Math.max(engineRPM, this.engine.idleRPM);
    }

    /**
     * Calculate slip ratio from wheel speed and vehicle speed
     * κ = (V_wheel - V_vehicle) / V_vehicle (for acceleration)
     */
    getSlipRatio() {
        const wheelSpeed = this.wheelAngularVel * this.wheelRadius;

        // Avoid division by zero at standstill
        if (Math.abs(this.velocity) < 0.1) {
            // At very low speeds, use wheel speed directly but limit it
            return wheelSpeed > 0 ? Math.min(wheelSpeed / 0.1, 0.3) : 0;
        }

        // Calculate slip ratio and clamp to reasonable range
        // Pacejka model typically works well for -1 to +1, but we'll be more conservative
        const slipRatio = (wheelSpeed - this.velocity) / this.velocity;
        return Math.max(-0.5, Math.min(0.5, slipRatio));
    }

    /**
     * Calculate tire force using actual slip ratio and Pacejka model
     */
    getTireForce() {
        // Get current slip ratio
        const slipRatio = this.getSlipRatio();

        // Update tire normal load based on current weight distribution
        const loads = this.getNormalLoads();
        this.tire.normalLoad = loads.rear;

        // Calculate tire force using Pacejka's Magic Formula
        // Force is per tire, we have 2 driven wheels (rear-wheel drive)
        const forcePerTire = this.tire.longitudinalForce(slipRatio);
        const totalTireForce = forcePerTire * 2;

        return totalTireForce;
    }

    /**
     * Calculate wheel torque from engine through transmission
     */
    getWheelTorque() {
        const engineRPM = this.getEngineRPM();
        const engineTorque = this.engine.torqueAtRPM(engineRPM) * this.throttle;
        return this.transmission.wheelTorque(engineTorque, this.currentGear);
    }

    /**
     * Calculate net force on vehicle
     */
    getNetForce() {
        const tireForce = this.getTireForce();
        const drag = this.dragForce();
        const rollingR = this.rollingResistance();

        return tireForce - drag - rollingR;
    }

    /**
     * Calculate derivatives for RK4 integration
     * Returns [wheelAngularAccel, vehicleAccel, velocity]
     */
    calculateDerivatives(wheelAngularVel, velocity) {
        // Temporarily set state for calculations
        const savedWheelVel = this.wheelAngularVel;
        const savedVelocity = this.velocity;
        this.wheelAngularVel = wheelAngularVel;
        this.velocity = velocity;

        // Calculate wheel torque from engine
        const wheelTorque = this.getWheelTorque();

        // Calculate tire force from current slip
        const tireForce = this.getTireForce();

        // Calculate tire reaction torque on wheel
        const tireReactionTorque = tireForce * this.wheelRadius;

        // Add damping torque
        const dampingTorque = this.wheelDamping * wheelAngularVel;

        // Calculate wheel angular acceleration
        const netWheelTorque = wheelTorque - tireReactionTorque - dampingTorque;
        const wheelAngularAccel = netWheelTorque / this.wheelInertia;

        // Calculate vehicle forces
        const drag = this.dragForce();
        const rollingR = this.rollingResistance();
        const netVehicleForce = tireForce - drag - rollingR;

        // Calculate vehicle acceleration
        const vehicleAccel = netVehicleForce / this.mass;

        // Restore state
        this.wheelAngularVel = savedWheelVel;
        this.velocity = savedVelocity;

        return [wheelAngularAccel, vehicleAccel, velocity];
    }

    /**
     * Update vehicle state for one time step with proper wheel dynamics
     * Uses RK4 integration for stability
     *
     * @param {number} dt - Time step in seconds
     */
    update(dt) {
        // Update shift cooldown
        this.shiftingCooldown = Math.max(0, this.shiftingCooldown - dt);

        // Save initial state
        const w0 = this.wheelAngularVel;
        const v0 = this.velocity;
        const p0 = this.position;

        // RK4 integration
        // k1 = f(t, y)
        const k1 = this.calculateDerivatives(w0, v0);

        // k2 = f(t + dt/2, y + k1*dt/2)
        const k2 = this.calculateDerivatives(
            w0 + k1[0] * dt/2,
            v0 + k1[1] * dt/2
        );

        // k3 = f(t + dt/2, y + k2*dt/2)
        const k3 = this.calculateDerivatives(
            w0 + k2[0] * dt/2,
            v0 + k2[1] * dt/2
        );

        // k4 = f(t + dt, y + k3*dt)
        const k4 = this.calculateDerivatives(
            w0 + k3[0] * dt,
            v0 + k3[1] * dt
        );

        // y_next = y + (k1 + 2*k2 + 2*k3 + k4) * dt/6
        this.wheelAngularVel = Math.max(0, w0 + (k1[0] + 2*k2[0] + 2*k3[0] + k4[0]) * dt/6);
        this.velocity = Math.max(0, v0 + (k1[1] + 2*k2[1] + 2*k3[1] + k4[1]) * dt/6);
        this.position = p0 + (k1[2] + 2*k2[2] + 2*k3[2] + k4[2]) * dt/6;

        // Get final state values for output
        const slipRatio = this.getSlipRatio();
        const tireForce = this.getTireForce();
        const wheelTorque = this.getWheelTorque();
        const vehicleAcceleration = (k1[1] + 2*k2[1] + 2*k3[1] + k4[1]) / 6;

        // Determine if tire or engine limited
        const wheelForceFromEngine = wheelTorque / this.wheelRadius;
        const tireLimited = tireForce < wheelForceFromEngine * 0.95;

        return {
            time: dt,
            velocity: this.velocity,
            acceleration: vehicleAcceleration,
            position: this.position,
            engineRPM: this.getEngineRPM(),
            gear: this.currentGear,
            tireForce: tireForce,
            tireLimited: tireLimited,
            slipRatio: slipRatio,
            wheelSpeed: this.wheelAngularVel * this.wheelRadius
        };
    }

    /**
     * Reset simulation
     */
    reset() {
        this.velocity = 0;
        this.position = 0;
        this.wheelAngularVel = 0;
        this.currentGear = 1;
        this.throttle = 0;
        this.shiftingCooldown = 0;
    }

    /**
     * Simulate 0-60 mph (0-26.8 m/s) acceleration
     * Returns time and whether it's tire-limited or engine-limited
     */
    simulate0to60() {
        this.reset();
        this.throttle = 1.0; // Full throttle

        // Initialize wheels to idle engine speed to avoid huge initial torque spike
        const idleWheelRPM = this.engine.idleRPM / this.transmission.totalRatio(1);
        this.wheelAngularVel = (idleWheelRPM * 2 * Math.PI) / 60;

        const targetSpeed = 26.8; // 60 mph in m/s
        const dt = 0.002; // 2ms time step for stability
        const maxTime = 30; // 30 second timeout

        let time = 0;
        const data = [];

        while (this.velocity < targetSpeed && time < maxTime) {
            // Simple auto-shift logic with cooldown to prevent bouncing
            const engineRPM = this.getEngineRPM();
            if (engineRPM > this.engine.redlineRPM * 0.95 &&
                this.currentGear < this.transmission.numGears &&
                this.shiftingCooldown <= 0) {
                this.currentGear++;
                this.shiftingCooldown = this.minShiftInterval;
            }

            const state = this.update(dt);
            time += dt;

            // Record data every 100ms
            if (Math.floor(time * 100) % 10 === 0) {
                data.push({
                    time: time,
                    position: this.position,
                    velocity: this.velocity,
                    velocityMPH: this.velocity * 2.237, // m/s to mph
                    velocityKMH: this.velocity * 3.6,   // m/s to km/h
                    acceleration: state.acceleration,
                    engineRPM: state.engineRPM,
                    gear: state.gear,
                    tireLimited: state.tireLimited
                });
            }
        }

        return {
            time0to60: time,
            data: data,
            success: this.velocity >= targetSpeed
        };
    }

    /**
     * Simulate quarter mile
     */
    simulateQuarterMile() {
        this.reset();
        this.throttle = 1.0;

        // Initialize wheels to idle engine speed
        const idleWheelRPM = this.engine.idleRPM / this.transmission.totalRatio(1);
        this.wheelAngularVel = (idleWheelRPM * 2 * Math.PI) / 60;

        const targetDistance = 402.336; // Quarter mile in meters
        const dt = 0.002; // 2ms time step for stability
        const maxTime = 60;

        let time = 0;
        const data = [];

        while (this.position < targetDistance && time < maxTime) {
            const engineRPM = this.getEngineRPM();
            if (engineRPM > this.engine.redlineRPM * 0.95 &&
                this.currentGear < this.transmission.numGears &&
                this.shiftingCooldown <= 0) {
                this.currentGear++;
                this.shiftingCooldown = this.minShiftInterval;
            }

            const state = this.update(dt);
            time += dt;

            if (Math.floor(time * 100) % 10 === 0) {
                data.push({
                    time: time,
                    position: this.position,
                    velocity: this.velocity,
                    velocityMPH: this.velocity * 2.237,
                    acceleration: state.acceleration,
                    engineRPM: state.engineRPM,
                    gear: state.gear
                });
            }
        }

        return {
            time: time,
            trapSpeed: this.velocity * 2.237, // Speed at end in mph
            data: data,
            success: this.position >= targetDistance
        };
    }
}
